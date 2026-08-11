import { FormEvent, useEffect, useState } from "react";
import { api, apiError } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Challans() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<any[]>([
    { productId: "", quantity: 1 }
  ]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Selected challan for View
  const [selectedChallan, setSelectedChallan] = useState<any | null>(null);
  const [loadingChallan, setLoadingChallan] = useState(false);

  async function load() {
    try {
      const [c, p, ch] = await Promise.all([
        api.get("/customers", { params: { limit: 100 } }),
        api.get("/products", { params: { limit: 100 } }),
        api.get("/challans")
      ]);

      setCustomers(c.data.data);
      setProducts(p.data.data);
      setRows(ch.data.data);
    } catch (e) {
      setError(apiError(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateItem(i: number, key: string, value: any) {
    setItems(
      items.map((x, idx) =>
        idx === i ? { ...x, [key]: value } : x
      )
    );
  }

  function getProduct(productId: string) {
    return products.find(
      p => Number(p.id) === Number(productId)
    );
  }

  function getLineTotal(item: any) {
    const product = getProduct(item.productId);

    if (!product) return 0;

    return (
      Number(product.unitPrice) *
      Number(item.quantity || 0)
    );
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + getLineTotal(item),
    0
  );

  const totalQuantity = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  async function create(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const { data } = await api.post("/challans", {
        customerId: Number(customerId),

        items: items.map(x => ({
          productId: Number(x.productId),
          quantity: Number(x.quantity)
        }))
      });

      setSuccess(
        `Created ${data.data.challanNumber} as DRAFT`
      );

      setCustomerId("");

      setItems([
        {
          productId: "",
          quantity: 1
        }
      ]);

      load();
    } catch (e) {
      setError(apiError(e));
    }
  }

  async function action(
    id: number,
    kind: "confirm" | "cancel"
  ) {
    setError("");
    setSuccess("");

    try {
      await api.post(`/challans/${id}/${kind}`);

      setSuccess(
        `Challan ${
          kind === "confirm"
            ? "confirmed"
            : "cancelled"
        } successfully`
      );

      load();
    } catch (e) {
      setError(apiError(e));
    }
  }

  // ============================================
  // VIEW CHALLAN
  // ============================================

  async function viewChallan(id: number) {
    setError("");
    setLoadingChallan(true);

    try {
      const { data } = await api.get(`/challans/${id}`);

      setSelectedChallan(data.data);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoadingChallan(false);
    }
  }

  function closeChallan() {
    setSelectedChallan(null);
  }

  // ============================================
  // PRINT CHALLAN
  // ============================================

  function printChallan() {
    window.print();
  }

  return (
    <>
      {/* ========================================
          PAGE HEADER
      ======================================== */}

      <div className="page-title">
        <div>
          <h2>Sales Challans</h2>

          <p className="muted">
            Create, view, confirm and cancel sales challans.
          </p>
        </div>
      </div>

      {/* ========================================
          ALERTS
      ======================================== */}

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert success">
          {success}
        </div>
      )}

      {/* ========================================
          CREATE CHALLAN
      ======================================== */}

      {(user?.role === "ADMIN" ||
        user?.role === "SALES") && (
        <form
          className="panel"
          onSubmit={create}
        >
          <div className="panel-title">
            Create Sales Challan
          </div>

          {/* Customer */}

          <label>
            Customer

            <select
              required
              value={customerId}
              onChange={e =>
                setCustomerId(e.target.value)
              }
            >
              <option value="">
                Select customer
              </option>

              {customers.map(c => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.businessName} — {c.name}
                </option>
              ))}
            </select>
          </label>

          {/* Products */}

          <div className="items-editor">
            {items.map((item, i) => {
              const product = getProduct(
                item.productId
              );

              const lineTotal =
                getLineTotal(item);

              return (
                <div
                  className="item-row"
                  key={i}
                >
                  {/* Product */}

                  <select
                    required
                    value={item.productId}
                    onChange={e =>
                      updateItem(
                        i,
                        "productId",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Product
                    </option>

                    {products.map(p => (
                      <option
                        key={p.id}
                        value={p.id}
                      >
                        {p.name} — ₹
                        {Number(
                          p.unitPrice
                        ).toLocaleString("en-IN")}{" "}
                        (stock {p.currentStock})
                      </option>
                    ))}
                  </select>

                  {/* Quantity */}

                  <input
                    required
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e =>
                      updateItem(
                        i,
                        "quantity",
                        e.target.value
                      )
                    }
                  />

                  {/* Line Amount */}

                  <div className="item-price">
                    {product ? (
                      <>
                        ₹
                        {lineTotal.toLocaleString(
                          "en-IN"
                        )}
                      </>
                    ) : (
                      "₹0"
                    )}
                  </div>

                  {/* Remove */}

                  <button
                    type="button"
                    className="secondary"
                    disabled={items.length === 1}
                    onClick={() =>
                      setItems(
                        items.filter(
                          (_, idx) =>
                            idx !== i
                        )
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}

          <div className="challan-summary">
            <div>
              <span>
                Total Quantity
              </span>

              <strong>
                {totalQuantity}
              </strong>
            </div>

            <div>
              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>
          </div>

          {/* Buttons */}

          <button
            type="button"
            className="secondary"
            onClick={() =>
              setItems([
                ...items,
                {
                  productId: "",
                  quantity: 1
                }
              ])
            }
          >
            + Add Product
          </button>

          <button
            className="primary"
            type="submit"
          >
            Save Draft
          </button>
        </form>
      )}

      {/* ========================================
          CHALLAN LIST
      ======================================== */}

      <div className="panel">
        <div className="panel-title">
          Challans
        </div>

        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(c => (
              <tr key={c.id}>
                <td>
                  {c.challanNumber}
                </td>

                <td>
                  {c.customer?.businessName}
                </td>

                <td>
                  {c.items?.length ?? 0}
                </td>

                <td>
                  {c.totalQuantity}
                </td>

                <td>
                  ₹
                  {Number(
                    c.totalAmount || 0
                  ).toLocaleString("en-IN")}
                </td>

                <td>
                  <span
                    className={`badge ${c.status.toLowerCase()}`}
                  >
                    {c.status}
                  </span>
                </td>

                <td>
                  {/* VIEW */}

                  <button
                    className="link-btn"
                    onClick={() =>
                      viewChallan(c.id)
                    }
                  >
                    View
                  </button>

                  {/* CONFIRM / CANCEL */}

                  {c.status === "DRAFT" &&
                    (user?.role === "ADMIN" ||
                      user?.role === "SALES") && (
                      <>
                        <button
                          className="link-btn"
                          onClick={() =>
                            action(
                              c.id,
                              "confirm"
                            )
                          }
                        >
                          Confirm
                        </button>

                        <button
                          className="link-btn danger"
                          onClick={() =>
                            action(
                              c.id,
                              "cancel"
                            )
                          }
                        >
                          Cancel
                        </button>
                      </>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========================================
          CHALLAN DETAILS MODAL
      ======================================== */}

      {selectedChallan && (
        <div
          className="modal-overlay challan-modal-overlay"
          onClick={closeChallan}
        >
          <div
            className="modal challan-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >
            {/* Modal Header */}

            <div className="modal-header">
              <div>
                <h3>
                  Sales Challan
                </h3>

                <p className="muted">
                  {selectedChallan.challanNumber}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeChallan}
              >
                ×
              </button>
            </div>

            {/* Company Heading */}

            <div className="print-company">
              <h2>
                Mini ERP CRM
              </h2>

              <p>
                Wholesale & Distribution
              </p>
            </div>

            {/* Challan Information */}

            <div className="challan-info-grid">
              <div>
                <span>
                  Challan Number
                </span>

                <strong>
                  {
                    selectedChallan.challanNumber
                  }
                </strong>
              </div>

              <div>
                <span>
                  Date
                </span>

                <strong>
                  {new Date(
                    selectedChallan.createdAt
                  ).toLocaleDateString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <strong>
                  {selectedChallan.status}
                </strong>
              </div>

              <div>
                <span>
                  Created By
                </span>

                <strong>
                  {
                    selectedChallan
                      .createdBy?.name
                  }
                </strong>
              </div>
            </div>

            {/* Customer */}

            <div className="challan-customer">
              <h4>
                Customer
              </h4>

              <strong>
                {
                  selectedChallan.customer
                    ?.businessName
                }
              </strong>

              <p>
                {
                  selectedChallan.customer
                    ?.name
                }
              </p>

              {selectedChallan.customer
                ?.mobile && (
                <p>
                  Mobile:{" "}
                  {
                    selectedChallan
                      .customer.mobile
                  }
                </p>
              )}

              {selectedChallan.customer
                ?.email && (
                <p>
                  Email:{" "}
                  {
                    selectedChallan
                      .customer.email
                  }
                </p>
              )}

              {selectedChallan.customer
                ?.address && (
                <p>
                  {
                    selectedChallan
                      .customer.address
                  }
                </p>
              )}
            </div>

            {/* Items */}

            <div className="challan-items">
              <h4>
                Products
              </h4>

              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedChallan.items?.map(
                    (item: any, index: number) => {
                      const amount =
                        Number(
                          item.unitPrice
                        ) *
                        Number(
                          item.quantity
                        );

                      return (
                        <tr
                          key={item.id}
                        >
                          <td>
                            {index + 1}
                          </td>

                          <td>
                            {
                              item.productName
                            }
                          </td>

                          <td>
                            {item.sku}
                          </td>

                          <td>
                            {
                              item.quantity
                            }
                          </td>

                          <td>
                            ₹
                            {Number(
                              item.unitPrice
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td>
                            ₹
                            {amount.toLocaleString(
                              "en-IN"
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}

            <div className="challan-total-box">
              <div>
                <span>
                  Total Quantity
                </span>

                <strong>
                  {
                    selectedChallan.totalQuantity
                  }
                </strong>
              </div>

              <div>
                <span>
                  Total Amount
                </span>

                <strong>
                  ₹
                  {Number(
                    selectedChallan.totalAmount ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            </div>

            {/* Modal Buttons */}

            <div className="modal-actions">
              <button
                className="secondary"
                onClick={closeChallan}
              >
                Close
              </button>

              <button
                className="primary"
                onClick={printChallan}
              >
                🖨 Print Challan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}

      {loadingChallan && (
        <div className="modal-overlay">
          <div className="modal">
            <p>
              Loading challan...
            </p>
          </div>
        </div>
      )}
    </>
  );
}