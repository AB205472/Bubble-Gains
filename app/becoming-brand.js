"use client";

import { useEffect } from "react";

const replacements = [
  [/Bubble Gains/g, "Becoming"],
  [/ALLI'S LIFE LEARNING BUBBLE/g, "ALLI'S LIFE IN PROGRESS"],
  [/PRIVATE BUBBLE/g, "PRIVATE GARDEN"],
  [/Today with Bubble/g, "Today in Becoming"],
  [/TODAY WITH BUBBLE/g, "TODAY IN BECOMING"],
  [/Bubble remembers/g, "Becoming remembers"],
  [/BUBBLE REMEMBERS/g, "BECOMING REMEMBERS"],
  [/Your Bubbles/g, "Your Garden"],
  [/All Bubbles/g, "The whole garden"],
  [/Bubble folders/g, "garden sections"],
  [/Bubble history/g, "Becoming history"],
  [/Bubble's AI/g, "Becoming's AI"],
  [/Bubble’s AI/g, "Becoming’s AI"],
  [/Bubble chat/g, "Becoming chat"],
  [/Bubble connected/g, "Becoming connected"],
  [/Bubble received/g, "Becoming received"],
  [/Bubble could/g, "Becoming could"],
  [/Bubble had/g, "Becoming had"],
  [/Bubble needs/g, "Becoming needs"],
  [/Bubble noticed/g, "Becoming noticed"],
  [/Bubble linked/g, "Becoming linked"],
  [/Bubble counted/g, "Becoming counted"],
  [/Bubble used/g, "Becoming used"],
  [/Bubble will/g, "Becoming will"],
  [/Bubble is/g, "Becoming is"],
  [/Bubble organizes it\./g, "Becoming helps you notice it."],
  [/Live your life\. Becoming helps you notice it\./g, "Learn yourself. Love yourself. Keep becoming."],
  [/Brave Bubble/g, "New Growth"],
  [/Strong Bubble/g, "Growing Strong"],
  [/Unstoppable Bubble/g, "Fully Becoming"],
  [/Fresh day, same Bubble\./g, "Fresh day. Keep becoming."],
  [/Sign into Bubble/g, "Sign into Becoming"],
  [/Opening Bubble/g, "Opening Becoming"],
  [/Saved privately to Bubble/g, "Saved privately to Becoming"],
  [/perform for Bubble/g, "perform here"],
  [/Tell Bubble/g, "Write anything"],
  [/Update Bubble/g, "Save growth"],
  [/Open Bubble/g, "Open section"],
  [/this Bubble/g, "this part of your life"],
  [/This Bubble/g, "This part of your life"],
  [/the Bubble/g, "Becoming"],
  [/Bubble/g, "Becoming"],
  [/Bubbles/g, "Garden"],
  [/bubbles/g, "garden"],
  [/🫧/g, "🌱"]
];

function replaceText(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    if (!node.nodeValue?.trim()) continue;
    let value = node.nodeValue;
    for (const [pattern, replacement] of replacements) value = value.replace(pattern, replacement);
    if (value !== node.nodeValue) node.nodeValue = value;
  }

  root.querySelectorAll?.("input[placeholder], textarea[placeholder]").forEach(element => {
    let value = element.getAttribute("placeholder") || "";
    for (const [pattern, replacement] of replacements) value = value.replace(pattern, replacement);
    element.setAttribute("placeholder", value);
  });
}

export default function BecomingBrand() {
  useEffect(() => {
    replaceText(document.body);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) replaceText(node.parentElement || document.body);
          if (node.nodeType === Node.ELEMENT_NODE) replaceText(node);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
