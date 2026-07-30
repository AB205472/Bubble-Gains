"use client";

import { useEffect } from "react";

const replacements = [
  [/live life[.,]?\s*bubble figures the rest out\.?/gi, "Learn yourself. Love yourself. Keep becoming."],
  [/bubble gains/gi, "Becoming"],
  [/alli's life learning bubble/gi, "ALLI'S LIFE IN PROGRESS"],
  [/private bubble/gi, "PRIVATE GARDEN"],
  [/today with bubble/gi, "Today in Becoming"],
  [/bubble['’]s live snapshot/gi, "TODAY'S LIVE SNAPSHOT"],
  [/bubble remembers/gi, "Becoming remembers"],
  [/your bubbles/gi, "Your Garden"],
  [/all bubbles/gi, "The whole garden"],
  [/bubble folders/gi, "garden sections"],
  [/bubble history/gi, "Becoming history"],
  [/bubble['’]s ai/gi, "Becoming's AI"],
  [/bubble chat/gi, "Becoming chat"],
  [/brave bubble/gi, "New Growth"],
  [/strong bubble/gi, "Growing Strong"],
  [/unstoppable bubble/gi, "Fully Becoming"],
  [/fresh day, same bubble\./gi, "Fresh day. Keep becoming."],
  [/sign into bubble/gi, "Sign into Becoming"],
  [/opening bubble/gi, "Opening Becoming"],
  [/saved privately to bubble/gi, "Saved privately to Becoming"],
  [/perform for bubble/gi, "perform here"],
  [/tell bubble/gi, "Write anything"],
  [/update bubble/gi, "Save growth"],
  [/open bubble/gi, "Open section"],
  [/this bubble/gi, "this part of your life"],
  [/the bubble/gi, "Becoming"],
  [/bubbles/gi, "garden"],
  [/bubble/gi, "Becoming"],
  [/🫧/g, "🌱"]
];

function transform(value = "") {
  return replacements.reduce((next, [pattern, replacement]) => next.replace(pattern, replacement), value);
}

function replaceText(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    if (!node.nodeValue?.trim()) continue;
    const value = transform(node.nodeValue);
    if (value !== node.nodeValue) node.nodeValue = value;
  }

  root.querySelectorAll?.("input[placeholder], textarea[placeholder], [aria-label], [title]").forEach(element => {
    for (const attribute of ["placeholder", "aria-label", "title"]) {
      if (!element.hasAttribute(attribute)) continue;
      const value = transform(element.getAttribute(attribute) || "");
      element.setAttribute(attribute, value);
    }
  });
}

export default function BecomingBrand() {
  useEffect(() => {
    const run = () => replaceText(document.body);
    run();
    requestAnimationFrame(run);
    const delayed = window.setTimeout(run, 350);

    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === "characterData") replaceText(record.target.parentElement || document.body);
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) replaceText(node.parentElement || document.body);
          if (node.nodeType === Node.ELEMENT_NODE) replaceText(node);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      window.clearTimeout(delayed);
      observer.disconnect();
    };
  }, []);

  return null;
}
