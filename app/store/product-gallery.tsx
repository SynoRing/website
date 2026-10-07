"use client";
import { useState } from "react";
import { RingVisual, circuitView } from "../product-visual";
import { fill } from "../text";
import type { PanelCopy } from "./purchase-panel";
import { storeRenders, type Finish } from "./product";

export function ProductGallery({ finish, copy }: { finish: Finish; copy: PanelCopy }) {
  const [view, setView] = useState("product");
  const name = copy.finishes[finish];
  const text = copy.gallery;
  const render = storeRenders[finish];
  return (
    <div
      className={`store-gallery preorder-gallery finish-${finish}`}
    >
      <div
        className="store-product-art"
        id="product-view"
        role="region"
        aria-label={
          view === "product" ? fill(text.product, { finish: name }) : text.inside
        }
      >
        {view === "product" ? (
          render ? (
            <img
              src={render.src}
              srcSet={render.srcSet}
              sizes="(max-width: 760px) 80vw, 440px"
              alt={fill(copy.renderAlt, { finish: name })}
            />
          ) : (
            <RingVisual finish={finish} />
          )
        ) : (
          <img
            src={circuitView.src}
            srcSet={circuitView.srcSet}
            sizes="(max-width: 760px) 80vw, 440px"
            alt={copy.circuitAlt}
          />
        )}
      </div>
      <div className="gallery-finish" aria-live="polite">
        {name}
        <span>SynoRing R1</span>
      </div>
      <div className="gallery-switch" role="group" aria-label={text.views}>
        <button
          aria-pressed={view === "product"}
          aria-controls="product-view"
          onClick={() => setView("product")}
        >
          {text.ring}
        </button>
        <button
          aria-pressed={view === "assembly"}
          aria-controls="product-view"
          onClick={() => setView("assembly")}
        >
          {text.insideButton}
        </button>
      </div>
    </div>
  );
}
