"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ProductGallery } from "./product-gallery";
import { RingVisual } from "../product-visual";
import {
  finishes,
  preorderPrice,
  regularPrice,
  storeRenders,
  type Finish,
} from "./product";
import type { WaitlistCopy } from "../copy/site";
import type { StoreCopy } from "../copy/store";
import type { Lang } from "../i18n";
import { CloseIcon, MinusIcon, PlusIcon } from "../icons";
import { fill } from "../text";
import { WaitlistForm } from "../waitlist-form";

/** The store's copy in the page's language, passed from the server. */
export type PanelCopy = Pick<StoreCopy, "panel" | "review" | "gallery"> & {
  finishes: Record<Finish, string>;
  renderAlt: string;
  circuitAlt: string;
  waitlist: WaitlistCopy;
};

export function PurchasePanel({ lang, copy }: { lang: Lang; copy: PanelCopy }) {
  const text = copy.panel;
  const [finish, setFinish] = useState<Finish>("space-gray");
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }
  return (
    <section
      className="store-product preorder-product content-width"
      id="early-access"
    >
      <ProductGallery finish={finish} copy={copy} />
      <div className="store-product-copy preorder-copy">
        <span className="status-pill">
          <span />
          {text.status}
        </span>
        <h1>SynoRing R1</h1>
        <p className="store-subtitle">{text.subtitle}</p>
        <p>{text.text}</p>
        <div className="preorder-pricing">
          <strong>
            <span className="sr-only">{text.preorderPrice}</span>$99
            <span>USD</span>
          </strong>
          <del>
            <span className="sr-only">{text.regularPrice}</span>$129
          </del>
          <span className="price-saving">{text.saving}</span>
        </div>
        <p className="price-caption">{text.priceCaption}</p>
        <fieldset className="finish-selector">
          <legend>
            {text.finish} <span aria-live="polite">{copy.finishes[finish]}</span>
          </legend>
          <div className="finish-options">
            {finishes.map((item) => (
              <label key={item.id}>
                <input
                  type="radio"
                  name="finish"
                  value={item.id}
                  checked={finish === item.id}
                  onChange={() => setFinish(item.id)}
                />
                <span
                  className="finish-swatch"
                  style={{ background: item.swatch }}
                />
                <span>{copy.finishes[item.id]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="purchase-quantity">
          <span id="quantity-label">{text.quantity}</span>
          <div
            className="quantity-stepper"
            role="group"
            aria-labelledby="quantity-label"
          >
            <button
              aria-label={text.decrease}
              disabled={quantity === 1}
              onClick={() => setQuantity((value) => value - 1)}
            >
              <MinusIcon />
            </button>
            <output aria-live="polite" aria-label={text.quantity}>
              {quantity}
            </output>
            <button
              aria-label={text.increase}
              disabled={quantity === 99}
              onClick={() => setQuantity((value) => value + 1)}
            >
              <PlusIcon />
            </button>
          </div>
        </div>
        <button
          ref={trigger}
          className="button button-dark store-cta preorder-button"
          onClick={() => setOpen(true)}
        >
          <span>{text.cta}</span>
          <span>${preorderPrice * quantity} USD</span>
        </button>
        <p className="dispatch-note">{text.dispatch}</p>
      </div>
      {open &&
        createPortal(
          <PreorderReview
            lang={lang}
            copy={copy}
            finish={finish}
            quantity={quantity}
            onClose={close}
          />,
          document.body,
        )}
    </section>
  );
}

function PreorderReview({
  lang,
  copy,
  finish,
  quantity,
  onClose,
}: {
  lang: Lang;
  copy: PanelCopy;
  finish: Finish;
  quantity: number;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [sent, setSent] = useState(false);
  const text = copy.review;
  const name = copy.finishes[finish];
  const render = storeRenders[finish];
  const total = preorderPrice * quantity;
  useEffect(() => {
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="preorder-dialog"
      aria-labelledby="preorder-review-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            onClose();
        }
      }}
    >
      <div className="review-heading">
        <span className="eyebrow">{text.eyebrow}</span>
        <button onClick={onClose} aria-label={text.close} autoFocus>
          <CloseIcon />
        </button>
      </div>
      <h2 id="preorder-review-title">{text.title}</h2>
      <div className="review-product">
        <div>
          {render ? (
            <img src={render.src} srcSet={render.srcSet} sizes="104px" alt="" />
          ) : (
            <RingVisual finish={finish} />
          )}
        </div>
        <div>
          <h3>SynoRing R1</h3>
          <p>{fill(text.line, { finish: name, quantity })}</p>
          <span>{fill(text.each, { price: preorderPrice })}</span>
        </div>
      </div>
      <dl className="review-totals">
        <div>
          <dt>{text.regularSubtotal}</dt>
          <dd>
            <del>${regularPrice * quantity} USD</del>
          </dd>
        </div>
        <div>
          <dt>{text.savings}</dt>
          <dd>−${(regularPrice - preorderPrice) * quantity} USD</dd>
        </div>
        <div>
          <dt>{text.subtotal}</dt>
          <dd>${total} USD</dd>
        </div>
      </dl>
      <p className="review-explainer">{text.explainer}</p>
      <WaitlistForm
        lang={lang}
        copy={copy.waitlist}
        layout="stacked"
        submitLabel={text.submit}
        details={{ source: "preorder", finish, quantity }}
        onDone={() => setSent(true)}
        done={(email) => (
          <>
            <strong>{text.doneTitle}</strong>{" "}
            {fill(text.doneText, { email, finish: name })}
          </>
        )}
      />
      <button className="review-back" onClick={onClose}>
        {sent ? text.closeDone : text.back}
      </button>
    </dialog>
  );
}
