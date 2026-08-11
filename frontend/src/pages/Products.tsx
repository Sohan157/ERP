import { FormEvent, useEffect, useState } from "react";
import {
  Package,
  Plus,
  Minus,
  History,
  X
} from "lucide-react";

import { api, apiError } from "../services/api";
import { useAuth } from "../context/AuthContext";

const empty = {
  name: "",
  sku: "",
  category: "",
  unitPrice: 0,
  currentStock: 0,
  minStock: 5,
  warehouseLocation: "A-01"
};

type StockType = "IN" | "OUT";

export default function Products() {
  const { user } = useAuth();

  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [stockProduct, setStockProduct] = useState<any>(null);
  const [stockType, setStockType] = useState<StockType>("IN");
  const [stockQuantity, setStockQuantity] = useState<number>(1);
  const [stockReason, setStockReason] = useState("");

  const [historyProduct, setHistoryProduct] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const canManage =
    user?.role === "ADMIN" || user?.role === "WAREHOUSE";

  async function load() {
    try {
      const { data } = await api.get("/products", {
        params: { limit: 100 }
      });

      setRows(data.data);
    } catch (e) {
      setError(apiError(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(empty);
    setEditing(null);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        unitPrice: Number(form.unitPrice),
        minStock: Number(form.minStock),
        currentStock: Number(form.currentStock)
      };

      if (editing !== null) {
        // Do not send currentStock while editing.
        // Stock changes should happen through Stock IN / OUT.
        const { currentStock, ...updatePayload } = payload;

        await api.put(`/products/${editing}`, updatePayload);

        setSuccess("Product updated successfully.");
      } else {
        await api.post("/products", payload);

        setSuccess("Product added successfully.");
      }

      resetForm();
      await load();
    } catch (e) {
      setError(apiError(e));
    }
  }

  function startEdit(product: any) {
    setError("");
    setSuccess("");

    setEditing(product.id);

    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitPrice: Number(product.unitPrice),
      currentStock: Number(product.currentStock),
      minStock: Number(product.minStock),
      warehouseLocation: product.warehouseLocation
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function openStock(product: any, type: StockType) {
    setError("");
    setSuccess("");

    setStockProduct(product);
    setStockType(type);
    setStockQuantity(1);
    setStockReason("");
  }

  async function saveStock(e: FormEvent) {
    e.preventDefault();

    if (!stockProduct) return;

    setError("");
    setSuccess("");

    if (stockQuantity <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    if (!stockReason.trim()) {
      setError("Please enter a reason.");
      return;
    }

    if (
      stockType === "OUT" &&
      stockQuantity > Number(stockProduct.currentStock)
    ) {
      setError(
        `Insufficient stock. Available stock: ${stockProduct.currentStock}`
      );
      return;
    }

    try {
      await api.post(
        `/inventory/${stockProduct.id}/stock`,
        {
          quantity: Number(stockQuantity),
          type: stockType,
          reason: stockReason.trim()
        }
      );

      setSuccess(
        stockType === "IN"
          ? `${stockQuantity} units added to ${stockProduct.name}.`
          : `${stockQuantity} units removed from ${stockProduct.name}.`
      );

      setStockProduct(null);

      await load();
    } catch (e) {
      setError(apiError(e));
    }
  }

  async function openHistory(product: any) {
    setError("");
    setHistoryProduct(product);
    setHistoryLoading(true);

    try {
      const { data } = await api.get("/inventory/movements");

      const productMovements = data.data.filter(
        (movement: any) =>
          Number(movement.productId) === Number(product.id)
      );

      setMovements(productMovements);
    } catch (e) {
      setError(apiError(e));
      setHistoryProduct(null);
    } finally {
      setHistoryLoading(false);
    }
  }

  function closeHistory() {
    setHistoryProduct(null);
    setMovements([]);
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Products</h2>
          <p className="muted">
            Product master and stock management.
          </p>
        </div>
      </div>

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

      {/* ADD / EDIT PRODUCT */}
      {canManage && (
        <form
          className="panel form-grid"
          onSubmit={save}
        >
          <div className="panel-title">
            {editing !== null
              ? "Edit Product"
              : "Add Product"}
          </div>

          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
            />
          </label>

          <label>
            SKU
            <input
              required
              value={form.sku}
              onChange={(e) =>
                setForm({
                  ...form,
                  sku: e.target.value
                })
              }
            />
          </label>

          <label>
            Category
            <input
              required
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value
                })
              }
            />
          </label>

          <label>
            Unit Price
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={(e) =>
                setForm({
                  ...form,
                  unitPrice: e.target.value
                })
              }
            />
          </label>

          <label>
            Current Stock
            <input
              type="number"
              min="0"
              value={form.currentStock}
              disabled={editing !== null}
              onChange={(e) =>
                setForm({
                  ...form,
                  currentStock: e.target.value
                })
              }
            />

            {editing !== null && (
              <small className="muted">
                Use Stock IN / OUT to change stock.
              </small>
            )}
          </label>

          <label>
            Min Stock
            <input
              type="number"
              min="0"
              value={form.minStock}
              onChange={(e) =>
                setForm({
                  ...form,
                  minStock: e.target.value
                })
              }
            />
          </label>

          <label>
            Warehouse Location
            <input
              required
              value={form.warehouseLocation}
              onChange={(e) =>
                setForm({
                  ...form,
                  warehouseLocation: e.target.value
                })
              }
            />
          </label>

          <div className="wide">
            <button
              className="primary"
              type="submit"
            >
              {editing !== null
                ? "Update Product"
                : "Add Product"}
            </button>

            {editing !== null && (
              <button
                type="button"
                className="secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* PRODUCT TABLE */}
      <div className="panel">
        <div className="panel-title">
          Product Inventory
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Warehouse</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  No products found.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {r.name}
                    </div>
                  </td>

                  <td>{r.sku}</td>

                  <td>{r.category}</td>

                  <td>
                    ₹
                    {Number(r.unitPrice).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td>
                    <strong>
                      {r.currentStock}
                    </strong>
                  </td>

                  <td>
                    {r.currentStock <= r.minStock ? (
                      <span className="badge cancelled">
                        LOW STOCK
                      </span>
                    ) : (
                      <span className="badge confirmed">
                        HEALTHY
                      </span>
                    )}
                  </td>

                  <td>
                    {r.warehouseLocation}
                  </td>

                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap"
                      }}
                    >
                      {canManage && (
                        <>
                          <button
                            className="link-btn"
                            onClick={() =>
                              startEdit(r)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="link-btn"
                            onClick={() =>
                              openStock(r, "IN")
                            }
                          >
                            Stock IN
                          </button>

                          <button
                            className="link-btn"
                            onClick={() =>
                              openStock(r, "OUT")
                            }
                          >
                            Stock OUT
                          </button>
                        </>
                      )}

                      <button
                        className="link-btn"
                        onClick={() =>
                          openHistory(r)
                        }
                      >
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* STOCK IN / OUT MODAL */}
      {stockProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              className="modal-close"
              onClick={() =>
                setStockProduct(null)
              }
            >
              <X size={20} />
            </button>

            <h2>
              {stockType === "IN"
                ? "Stock IN"
                : "Stock OUT"}
            </h2>

            <p className="muted">
              Update inventory for{" "}
              <strong>
                {stockProduct.name}
              </strong>
            </p>

            <div className="panel"
              style={{ marginTop: 20 }}
            >
              <div>
                <span className="muted">
                  Current Stock
                </span>

                <h2>
                  {stockProduct.currentStock}
                </h2>
              </div>
            </div>

            <form
              className="form-grid"
              onSubmit={saveStock}
            >
              <label>
                Movement Type
                <select
                  value={stockType}
                  onChange={(e) =>
                    setStockType(
                      e.target.value as StockType
                    )
                  }
                >
                  <option value="IN">
                    Stock IN
                  </option>

                  <option value="OUT">
                    Stock OUT
                  </option>
                </select>
              </label>

              <label>
                Quantity
                <input
                  type="number"
                  min="1"
                  required
                  value={stockQuantity}
                  onChange={(e) =>
                    setStockQuantity(
                      Number(e.target.value)
                    )
                  }
                />
              </label>

              <label className="wide">
                Reason
                <textarea
                  required
                  rows={4}
                  placeholder={
                    stockType === "IN"
                      ? "Example: Purchase received"
                      : "Example: Sold to customer"
                  }
                  value={stockReason}
                  onChange={(e) =>
                    setStockReason(
                      e.target.value
                    )
                  }
                />
              </label>

              <div className="wide">
                <button
                  type="button"
                  className="secondary"
                  onClick={() =>
                    setStockProduct(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                >
                  {stockType === "IN"
                    ? "Add Stock"
                    : "Remove Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK HISTORY MODAL */}
      {historyProduct && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              maxWidth: "900px"
            }}
          >
            <button
              className="modal-close"
              onClick={closeHistory}
            >
              <X size={20} />
            </button>

            <h2>
              Stock Movement History
            </h2>

            <p className="muted">
              {historyProduct.name} —{" "}
              {historyProduct.sku}
            </p>

            {historyLoading ? (
              <div className="loading">
                Loading history...
              </div>
            ) : movements.length === 0 ? (
              <div className="empty-state">
                No stock movements found.
              </div>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                  marginTop: "20px"
                }}
              >
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Reason</th>
                      <th>Created By</th>
                    </tr>
                  </thead>

                  <tbody>
                    {movements.map(
                      (movement) => (
                        <tr
                          key={movement.id}
                        >
                          <td>
                            {new Date(
                              movement.createdAt
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td>
                            {movement.type ===
                            "IN" ? (
                              <span className="badge confirmed">
                                IN
                              </span>
                            ) : (
                              <span className="badge cancelled">
                                OUT
                              </span>
                            )}
                          </td>

                          <td>
                            <strong>
                              {movement.type ===
                              "IN"
                                ? "+"
                                : "-"}
                              {movement.quantity}
                            </strong>
                          </td>

                          <td>
                            {movement.reason}
                          </td>

                          <td>
                            {movement.createdBy
                              ?.name ||
                              "Unknown"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div
              style={{
                marginTop: "20px",
                textAlign: "right"
              }}
            >
              <button
                className="secondary"
                onClick={closeHistory}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}