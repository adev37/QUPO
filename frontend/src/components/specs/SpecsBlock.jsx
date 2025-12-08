// frontend/src/components/specs/SpecsBlock.jsx
import React, { useEffect, useMemo, useState } from "react";

const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const norm = (s) => (s || "").toString().trim().toLowerCase();

function buildItemKeys(item) {
  const name = norm(item.description);
  const model = norm(item.modelNo || item.model || "");
  const hsn = item.hsn ? `hsn:${norm(item.hsn)}` : "";

  return [
    name,
    model && `model:${model}`,
    name && model && `${name} ${model}`,
    hsn,
  ].filter(Boolean);
}

const SpecsBlock = ({ items = [], heading = "Specifications" }) => {
  const [specIndex, setSpecIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/specs/index.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSpecIndex(data);
      })
      .catch(() => {
        if (!cancelled) setSpecIndex({ items: [] });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const matches = useMemo(() => {
    if (!specIndex?.items?.length || !items?.length) return [];
    const chosen = new Set();
    const out = [];

    items.forEach((it) => {
      if (!it) return;
      const keys = buildItemKeys(it);
      if (!keys.length) return;

      let hit = specIndex.items.find((sp) =>
        sp.keys?.some(
          (k) =>
            keys.some((q) => norm(k) === norm(q)) ||
            norm(k) === norm(it.description)
        )
      );

      if (!hit) {
        hit = specIndex.items.find((sp) =>
          sp.keys?.some((k) =>
            keys.some((q) => norm(k).startsWith(norm(q)))
          )
        );
      }

      if (hit && !chosen.has(hit.id || hit.title)) {
        chosen.add(hit.id || hit.title);
        out.push(hit);
      }
    });

    return out.map((sp, i) => ({
      label: ABC[i] || `${i + 1}`,
      ...sp,
    }));
  }, [specIndex, items]);

  if (!items?.length) return null;

  return (
    <section className="mt-6 specs-block">
      <h3 className="font-semibold text-sm md:text-base mb-2">{heading}</h3>

      {matches.length === 0 && (
        <p className="text-xs text-slate-600">
          No matching specifications found for the current items.
        </p>
      )}

      {matches.map((sp) => (
        <div
          key={sp.id || sp.title}
          className="mb-4 break-inside-avoid print:break-inside-avoid"
        >
          <div className="font-semibold text-sm mb-1">
            {sp.label}. {sp.title}
          </div>
          <div
            className="border rounded p-2 text-xs md:text-sm specs-html"
            dangerouslySetInnerHTML={{ __html: sp.html }}
          />
        </div>
      ))}
    </section>
  );
};

export default SpecsBlock;
