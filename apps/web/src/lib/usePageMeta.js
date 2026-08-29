import React from "react";

const BASE = "https://jobcompass.io";

export function usePageMeta(title, description, path) {
  React.useEffect(() => {
    if (title) document.title = title;
    const setMeta = (selector, attr, key, value) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };
    if (description) setMeta('meta[name="description"]', "name", "description", description);
    if (path) {
      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", BASE + path);
    }
    if (title) setMeta('meta[property="og:title"]', "property", "og:title", title);
    if (description) setMeta('meta[property="og:description"]', "property", "og:description", description);
  }, [title, description, path]);
}
