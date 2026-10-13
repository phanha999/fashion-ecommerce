import { shopifyFetch } from './client';

const METAOBJECTS_QUERY = `
  query ContentMetaobjects($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first) {
      nodes {
        id
        handle
        fields {
          key
          type
          value
          reference {
            __typename
            ... on MediaImage { image { url altText } }
            ... on GenericFile { url alt }
            ... on Collection { handle title image { url altText } }
          }
        }
      }
    }
  }
`;
const METAOBJECT_BY_HANDLE_QUERY = `
  query ContentMetaobject($handle: MetaobjectHandleInput!) {
    metaobject(handle: $handle) {
      id
      handle
      fields {
        key
        type
        value
        reference {
          __typename
          ... on MediaImage { image { url altText } }
          ... on GenericFile { url alt }
          ... on Collection { handle title image { url altText } }
        }
      }
    }
  }
`;

export async function getMetaobjectEntries(type, first = 20) {
  const normalizedType = type?.trim();
  if (!normalizedType) throw new Error('A Shopify metaobject type is required.');

  const data = await shopifyFetch(METAOBJECTS_QUERY, {
    type: normalizedType,
    first,
  });
  return data.metaobjects?.nodes || [];
}

export async function getMetaobjectEntry(type, handle) {
  const normalizedType = type?.trim();
  const normalizedHandle = handle?.trim();
  if (!normalizedType || !normalizedHandle) {
    throw new Error('A Shopify metaobject type and handle are required.');
  }

  const data = await shopifyFetch(METAOBJECT_BY_HANDLE_QUERY, {
    handle: {
      type: normalizedType,
      handle: normalizedHandle,
    },
  });
  return data.metaobject || null;
}
export function getMetaobjectFields(entry) {
  return Object.fromEntries(entry.fields.map((field) => [field.key, field]));
}

export function getMetaobjectImage(entry, preferredKey) {
  const imageField = preferredKey
    ? entry.fields.find((field) => field.key === preferredKey)
    : entry.fields.find((field) => field.type === 'file_reference')
      || entry.fields.find((field) => /image|photo|picture|banner|hero_slide/i.test(field.key));
  const reference = imageField?.reference;
  const value = imageField?.value || '';

  return {
    field: imageField,
    url: reference?.image?.url
      || reference?.url
      || (reference?.__typename === 'Collection' ? reference.image?.url : '')
      || (/^https?:\/\//i.test(value) ? value : ''),
    alt: reference?.image?.altText
      || reference?.alt
      || (reference?.__typename === 'Collection' ? reference.image?.altText : '')
      || '',
  };
}

function getFieldValue(fields, keys) {
  for (const key of keys) {
    if (fields[key]?.value) return fields[key].value;
  }

  return '';
}

function getCategoryLink(url, collectionHandle) {
  if (collectionHandle) {
    return '/shop?collection=' + encodeURIComponent(collectionHandle);
  }

  if (url) {
    return url;
  }

  return '/shop';
}

async function getCategoryDestinations(entries) {
  const normalize = value => value.trim().normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ');
  const destinations = new Map();
  const unresolved = [];
  for (const entry of entries) {
    const fields = getMetaobjectFields(entry);
    const reference = entry.fields.find(field => field.reference?.__typename === 'Collection');
    const handle = reference?.reference.handle || getFieldValue(fields, ['collection_handle'])
      || (fields.collection?.type === 'single_line_text_field' ? fields.collection.value : '');
    const url = getFieldValue(fields, ['url', 'link', 'collection_url', 'button_url']);
    if (handle || url) destinations.set(entry.id, getCategoryLink(url, handle));
    else unresolved.push({ id: entry.id, title: getFieldValue(fields, ['title', 'name', 'category_name', 'label']) });
  }
  if (unresolved.length) {
    const matches = new Map();
    let after = null;
    do {
      const data = await shopifyFetch(`query NavigationCollections($after: String) {
        collections(first: 250, after: $after) { nodes { handle title } pageInfo { hasNextPage endCursor } }
      }`, { after });
      for (const collection of data.collections.nodes) {
        const key = normalize(collection.title);
        // Ambiguous names must be linked explicitly in Shopify.
        matches.set(key, matches.has(key) ? null : collection.handle);
      }
      const page = data.collections.pageInfo;
      if (page.hasNextPage && (!page.endCursor || page.endCursor === after)) throw new Error('Could not load collection navigation.');
      after = page.hasNextPage ? page.endCursor : null;
    } while (after);
    for (const entry of unresolved) destinations.set(entry.id, getCategoryLink('', matches.get(normalize(entry.title))));
  }
  return destinations;
}

export async function getHeroBanners({ first = 10, type = 'hero_slide' } = {}) {
  const entries = await getMetaobjectEntries(type, first);

  const records = entries.map((entry) => {
    const fields = getMetaobjectFields(entry);
    const image = getMetaobjectImage(entry);

    return {
      banner: {
        id: entry.id,
        image: image.url,
        imageAlt: image.alt || fields.title?.value || '',
        subtitle: fields.subtitle?.value || '',
        title: fields.title?.value || '',
        description: fields.description?.value || '',
        button: fields.button_label?.value || 'Shop Now',
        button_url: fields.url?.value || fields.button_url?.value || '/shop',
      },
      diagnostic: entry.handle + ': image field=' + (image.field?.key || 'not found')
        + ', type=' + (image.field?.type || 'missing')
        + ', reference=' + (image.field?.reference?.__typename || 'empty')
        + ', fields=[' + entry.fields.map((field) => field.key).join(', ') + ']',
    };
  });

  const banners = records
    .map(({ banner }) => banner)
    .filter((banner) => banner.image);

  if (banners.length === 0) {
    const details = records.length
      ? records.map(({ diagnostic }) => diagnostic).join(' | ')
      : 'No entries returned for metaobject type "' + type + '".';
    throw new Error('Shopify returned no hero image URL. ' + details);
  }

  return banners;
}

export async function getCategories({ first = 20, type = 'image_category' } = {}) {
  const entries = await getMetaobjectEntries(type, first);
  if (entries.length === 0) {
    throw new Error('No Shopify entries found for metaobject type "' + type.trim() + '". Check the definition API type and that entries are Active.');
  }

  const destinations = await getCategoryDestinations(entries);
  const categories = entries.map((entry) => {
    const fields = getMetaobjectFields(entry);
    const image = getMetaobjectImage(entry);
    const title = getFieldValue(fields, ['title', 'name', 'category_name', 'label'])
      || entry.handle.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

    return {
      id: entry.id,
      title,
      image: image.url,
      imageAlt: image.alt || title,
      link: destinations.get(entry.id),
    };
  }).filter((category) => category.image);

  if (categories.length === 0) {
    const fieldKeys = entries.map((entry) => entry.handle + ': ' + entry.fields.map((field) => field.key + ' (' + field.type + ')').join(', ')).join(' | ');
    throw new Error('Category entries were found, but none has a readable image field. Fields returned: ' + fieldKeys);
  }

  return categories;
}

export async function getCollection({ first = 20, type = 'image_collection' } = {}) {
  const entries = await getMetaobjectEntries(type, first);
  if (entries.length === 0) {
    throw new Error('No Shopify entries found for metaobject type "' + type.trim() + '". Check the definition API type and that entries are Active.');
  }

  const destinations = await getCategoryDestinations(entries);
  const categories = entries.map((entry) => {
    const fields = getMetaobjectFields(entry);
    const image = getMetaobjectImage(entry);
    const title = getFieldValue(fields, ['title', 'name', 'category_name', 'label'])
      || entry.handle.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

    return {
      id: entry.id,
      title,
      description: fields.description?.value || '',
      image: image.url,
      imageAlt: image.alt || title,
      link: destinations.get(entry.id),
    };
  }).filter((category) => category.image);

  if (categories.length === 0) {
    const fieldKeys = entries.map((entry) => entry.handle + ': ' + entry.fields.map((field) => field.key + ' (' + field.type + ')').join(', ')).join(' | ');
    throw new Error('Category entries were found, but none has a readable image field. Fields returned: ' + fieldKeys);
  }

  return categories;
}

export async function getBanners({ first = 20, type = 'image_banner', handle } = {}) {
  const entry = handle ? await getMetaobjectEntry(type, handle) : null;
  const entries = handle
    ? (entry ? [entry] : [])
    : await getMetaobjectEntries(type, first);

  if (entries.length === 0) {
    const target = handle
      ? ' with handle "' + handle.trim() + '"'
      : '';
    throw new Error('No Shopify entry found for metaobject type "' + type.trim() + '"' + target + '. Check the handle and that the entry is Active.');
  }

  const banners = entries.map((entry) => {
    const fields = getMetaobjectFields(entry);
    const image = getMetaobjectImage(entry);
    const title = getFieldValue(fields, ['title', 'name', 'heading'])
      || entry.handle.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

    return {
      id: entry.id,
      title,
      subtitle: fields.subtitle?.value || '',
      description: fields.description?.value || '',
      image: image.url,
      imageAlt: image.alt || fields.image_alt?.value || title,
      buttonLabel: fields.button_label?.value || 'Shop now',
      // Banner destinations come directly from Shopify so each entry can choose its own URL.
      link: getFieldValue(fields, ['url', 'link', 'collection_url', 'button_url']),
      link_2: getFieldValue(fields, ['url_2', 'link_2', 'collection_url_2', 'button_url_2']),
    };
  }).filter((banner) => banner.image);

  if (banners.length === 0) {
    const fieldKeys = entries.map((entry) => entry.handle + ': ' + entry.fields.map((field) => field.key + ' (' + field.type + ')').join(', ')).join(' | ');
    throw new Error('Image Banner entries were found, but none has a readable image field. Fields returned: ' + fieldKeys);
  }

  return banners;
}

export async function getBrands({ first = 50, type = 'image_brands' } = {}) {
  const entries = await getMetaobjectEntries(type, first);
  if (entries.length === 0) {
    throw new Error('No Shopify entries found for metaobject type "' + type.trim() + '". Check the definition API type and that entries are Active.');
  }

  const brands = entries.map((entry) => {
    const fields = getMetaobjectFields(entry);
    const background = getMetaobjectImage(entry, 'background_image');
    const logo = getMetaobjectImage(entry, 'image');

    return {
      id: entry.id,
      backgroundImage: background.url,
      altBackgroundImage: fields.alt_background_image?.value || '',
      image: logo.url,
      imageAlt: fields.alt_image?.value || entry.handle,
    };
  }).filter((brand) => brand.backgroundImage && brand.image);

  if (brands.length === 0) {
    const fieldKeys = entries.map((entry) => entry.handle + ': ' + entry.fields.map((field) => field.key + ' (' + field.type + ')').join(', ')).join(' | ');
    throw new Error('Image Brands entries were found, but none has both readable images. Fields returned: ' + fieldKeys);
  }

  return brands;
}

export async function getInstagrams({ first = 50, type = 'image_instagram' } = {}) {
  const entries = await getMetaobjectEntries(type, first);
  if (entries.length === 0) {
    throw new Error('No Shopify entries found for metaobject type "' + type.trim() + '". Check the definition API type and that entries are Active.');
  }

  const instagrams = entries.map((entry) => {
    const fields = getMetaobjectFields(entry);
    const logo = getMetaobjectImage(entry, 'image');

    return {
      id: entry.id,
      image: logo.url,
      imageAlt: fields.alt_image?.value || entry.handle,
      link: fields.url?.value || '',
    };
  }).filter((instagram) => instagram.image);

  if (instagrams.length === 0) {
    const fieldKeys = entries.map((entry) => entry.handle + ': ' + entry.fields.map((field) => field.key + ' (' + field.type + ')').join(', ')).join(' | ');
    throw new Error('Image instagrams entries were found, but none has a readable image. Fields returned: ' + fieldKeys);
  }

  return instagrams;
}


