import { useEffect, useState } from "react";
import { api, apiError } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Inventory() {
  const { user } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [moves, setMoves] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      setError("");

      const [productsResponse, movementsResponse] = await Promise.all([
        api.get("/inventory"),
        api.get("/inventory/movements"),
      ]);

      setProducts(productsResponse.data.data);
      setMoves(movementsResponse.data.data);
    } catch (e) {
      setError(apiError(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStock(product: any) {
    setError("");
    setSuccess("");

    const qtyInput = window.prompt(
      `Enter quantity for ${product.name}:`,
      "1"
    );

    if (qtyInput === null) return;

    const qty = Number(qtyInput);

    if (!Number.isInteger(qty) || qty <= 0) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    const typeInput = window
      .prompt("Enter movement type: IN or OUT", "IN")
      ?.trim()
      .toUpperCase();

    if (typeInput !== "IN" && typeInput !== "OUT") {
      setError("Movement type must be IN or OUT.");
      return;
    }

    if (typeInput === "OUT" && qty > product.currentStock) {
      setError(
        `Cannot remove ${qty} units. Available stock is ${product.currentStock}.`
      );
      return;
    }

    const reason =
      window.prompt(
        "Enter reason:",
        typeInput === "IN"
          ? "Stock received"
          : "Manual stock adjustment"
      ) || "Manual stock adjustment";

    try {
      await api.post(`/inventory/${product.id}/stock`, {
        quantity: qty,
        type: typeInput,
        reason,
      });

      setSuccess(
        `${typeInput === "IN" ? "Added" : "Removed"} ${qty} unit${
          qty !== 1 ? "s" : ""
        } ${typeInput === "IN" ? "to" : "from"} ${product.name}.`
      );

      await load();
    } catch (e) {
      setError(apiError(e));
    }
  }

  function getStatus(product: any) {
    if (product.currentStock <= product.minStock) {
      return (
        <span className="badge cancelled">
          LOW STOCK
        </span>
      );
    }

    return (
      <span className="badge confirmed">
        HEALTHY
      </span>
    );
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Inventory</h2>
          <p className="muted">
            Monitor stock levels and manage stock movements.
          </p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {success && <div className="alert success">{success}</div>}

      {/* CURRENT STOCK */}
      <div className="panel">
        <div className="panel-title">Current Stock</div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Warehouse</th>
              <th>Current Stock</th>
              <th>Minimum Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>

                  <td>{product.sku}</td>

                  <td>{product.warehouseLocation}</td>

                  <td>
                    <strong>{product.currentStock}</strong>
                  </td>

                  <td>{product.minStock}</td>

                  <td>{getStatus(product)}</td>

                  <td>
                    {(user?.role === "ADMIN" ||
                      user?.role === "WAREHOUSE") && (
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => changeStock(product)}
                      >
                        Adjust
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* STOCK MOVEMENT HISTORY */}
      <div className="panel">
        <div className="panel-title">
          Stock Movement History
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Reason</th>
              <th>Created By</th>
            </tr>
          </thead>

          <tbody>
            {moves.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  No stock movements found.
                </td>
              </tr>
            ) : (
              moves.map((movement) => (
                <tr key={movement.id}>
                  <td>
                    {new Date(
                      movement.createdAt
                    ).toLocaleString()}
                  </td>

                  <td>
                    {movement.product?.name || "-"}
                  </td>

                  <td>
                    {movement.product?.sku || "-"}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        movement.type === "IN"
                          ? "confirmed"
                          : "cancelled"
                      }`}
                    >
                      {movement.type}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {movement.type === "OUT"
                        ? `-${movement.quantity}`
                        : `+${movement.quantity}`}
                    </strong>
                  </td>

                  <td>{movement.reason}</td>

                  <td>
                    {movement.createdBy?.name || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}