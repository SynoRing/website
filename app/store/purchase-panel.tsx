"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ProductGallery } from "./product-gallery";
import { RingVisual } from "../product-visual";
import { finishes, preorderPrice, regularPrice, type Finish } from "./product";
import { CloseIcon, MinusIcon, PlusIcon } from "../icons";

export function PurchasePanel() {
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
      <ProductGallery finish={finish} />
      <div className="store-product-copy preorder-copy">
        <span className="status-pill">
          <span />
          Pre-order
        </span>
        <h1>SynoRing</h1>
        <p className="store-subtitle">Your world. At your fingertips.</p>
        <p>
          A wearable gesture controller for AR glasses. Tap, glide, and circle
          to select, scroll, and adjust.
        </p>
        <div className="preorder-pricing">
          <strong>
            <span className="sr-only">Pre-order price: </span>$99
            <span>USD</span>
          </strong>
          <del>
            <span className="sr-only">Regular price: </span>$129
          </del>
          <span className="price-saving">Save $30</span>
        </div>
        <p className="price-caption">Pre-order pricing</p>
        <fieldset className="finish-selector">
          <legend>
            Finish{" "}
            <span aria-live="polite">
              {finishes.find((item) => item.id === finish)!.name}
            </span>
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
                <span>{item.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="purchase-quantity">
          <span id="quantity-label">Quantity</span>
          <div
            className="quantity-stepper"
            role="group"
            aria-labelledby="quantity-label"
          >
            <button
              aria-label="Decrease quantity"
              disabled={quantity === 1}
              onClick={() => setQuantity((value) => value - 1)}
            >
              <MinusIcon />
            </button>
            <output aria-live="polite" aria-label="Quantity">
              {quantity}
            </output>
            <button
              aria-label="Increase quantity"
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
          <span>Pre-order</span>
          <span>${preorderPrice * quantity} USD</span>
        </button>
        <p className="dispatch-note">
          Estimated dispatch date to be announced.
        </p>
      </div>
      {open &&
        createPortal(
          <PreorderReview
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
  finish,
  quantity,
  onClose,
}: {
  finish: Finish;
  quantity: number;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const name = finishes.find((item) => item.id === finish)!.name;
  const total = preorderPrice * quantity;
  const email = `mailto:hello@synoring.com?subject=${encodeURIComponent(`SynoRing Pre-order — ${name}`)}&body=${encodeURIComponent(`Hi SynoRing team,\n\nI would like to enquire about this pre-order:\n\nProduct: SynoRing\nFinish: ${name}\nQuantity: ${quantity}\nPre-order unit price: $${preorderPrice} USD (regular $${regularPrice} USD)\nProduct subtotal: $${total} USD\n\nPlease confirm availability, sizing, shipping, taxes, and payment arrangements.\n\nName:\nCountry / region:\n`)}`;
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
        <span className="eyebrow">Pre-order enquiry</span>
        <button onClick={onClose} aria-label="Close pre-order review" autoFocus>
          <CloseIcon />
        </button>
      </div>
      <h2 id="preorder-review-title">Your SynoRing.</h2>
      <div className="review-product">
        <div>
          <RingVisual finish={finish} />
        </div>
        <div>
          <h3>SynoRing</h3>
          <p>
            {name} · Qty {quantity}
          </p>
          <span>${preorderPrice} USD each</span>
        </div>
      </div>
      <dl className="review-totals">
        <div>
          <dt>Regular subtotal</dt>
          <dd>
            <del>${regularPrice * quantity} USD</del>
          </dd>
        </div>
        <div>
          <dt>Pre-order savings</dt>
          <dd>−${(regularPrice - preorderPrice) * quantity} USD</dd>
        </div>
        <div>
          <dt>Product subtotal</dt>
          <dd>${total} USD</dd>
        </div>
      </dl>
      <p className="review-explainer">
        Send your selection to our team to arrange your pre-order. Shipping,
        taxes, sizing, and delivery will be confirmed by email. No payment is
        collected or order placed on this website.
      </p>
      <a className="button button-dark" href={email}>
        Email pre-order enquiry
      </a>
      <button className="review-back" onClick={onClose}>
        Continue choosing
      </button>
    </dialog>
  );
}
