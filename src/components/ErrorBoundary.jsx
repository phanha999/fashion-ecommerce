import { t } from "../utils/translations";
import { Component } from 'react';
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main role="alert" className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="text-2xl font-bold">{t("Something went wrong")}</h1><p className="mt-4">{t("Please reload this page and try again.")}</p><button onClick={() => window.location.reload()} className="mt-6 bg-gray-900 px-6 py-3 text-white">{t("Reload")}</button></main>;
    return this.props.children;
  }
}
