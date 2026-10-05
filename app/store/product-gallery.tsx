"use client";
import { useState } from "react";
import { RingVisual, circuitView } from "../product-visual";
import { finishes, storeRenders, type Finish } from "./product";
export function ProductGallery({ finish }: { finish: Finish }) {
  const [view, setView] = useState("product");
  const name = finishes.find((item) => item.id === finish)!.name;
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
          view === "product"
            ? `${name} product concept`
            : "Inside SynoRing: flexible circuit and battery"
        }
      >
        {view === "product" ? (
          render ? (
            <img
              src={render.src}
              srcSet={render.srcSet}
              sizes="(max-width: 760px) 80vw, 440px"
              alt={render.alt}
            />
          ) : (
            <RingVisual finish={finish} />
          )
        ) : (
          <img
            src={circuitView.src}
            srcSet={circuitView.srcSet}
            sizes="(max-width: 760px) 80vw, 440px"
            alt={circuitView.alt}
          />
        )}
      </div>
      <div className="gallery-finish" aria-live="polite">
        {name}
        <span>SynoRing R1</span>
      </div>
      <div className="gallery-switch" role="group" aria-label="Product views">
        <button
          aria-pressed={view === "product"}
          aria-controls="product-view"
          onClick={() => setView("product")}
        >
          The ring
        </button>
        <button
          aria-pressed={view === "assembly"}
          aria-controls="product-view"
          onClick={() => setView("assembly")}
        >
          Inside SynoRing
        </button>
      </div>
    </div>
  );
}
