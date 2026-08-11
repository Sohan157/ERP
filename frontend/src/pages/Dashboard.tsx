import { useEffect, useState } from "react";
import { api, apiError } from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setError("");

      const response = await api.get("/dashboard");

      setData(response.data.data);
    } catch (e) {
      setError(apiError(e));
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (error) {
    return (
      <div>
        <div className="page-title">
          <div>
            <h2>Dashboard</h2>
            <p className="muted">Overview of your ERP system.</p>
          </div>
        </div>

        <div className="alert error">{error}</div>
      </div>
    );
  }

  if (!data) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <>
      {/* PAGE TITLE */}
      <div className="page-title">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">
            Overview of customers, products, inventory and sales.
          </p>
        </div>
      </div>

      {/* MAIN STATISTICS */}
      <div className="cards">

        {/* CUSTOMERS */}
        <div className="card metric">
          <div className="icon-box">👥</div>

          <div>
            <span>Total Customers</span>
            <strong>{data.customers}</strong>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="card metric">
          <div className="icon-box">📦</div>

          <div>
            <span>Total Products</span>
            <strong>{data.products}</strong>
          </div>
        </div>

        {/* LOW STOCK */}
        <div className="card metric">
          <div className="icon-box">⚠️</div>

          <div>
            <span>Low Stock</span>
            <strong>{data.lowStock}</strong>
          </div>
        </div>

        {/* CHALLANS */}
        <div className="card metric">
          <div className="icon-box">📄</div>

          <div>
            <span>Total Challans</span>
            <strong>{data.challans}</strong>
          </div>
        </div>

      </div>

      {/* CUSTOMER STATISTICS */}
      <div className="cards">

        <div className="card metric">
          <div className="icon-box">✅</div>

          <div>
            <span>Active Customers</span>
            <strong>{data.activeCustomers}</strong>
          </div>
        </div>

        <div className="card metric">
          <div className="icon-box">🎯</div>

          <div>
            <span>Leads</span>
            <strong>{data.leadCustomers}</strong>
          </div>
        </div>

        <div className="card metric">
          <div className="icon-box">⏸️</div>

          <div>
            <span>Inactive Customers</span>
            <strong>{data.inactiveCustomers}</strong>
          </div>
        </div>

        <div className="card metric">
          <div className="icon-box">📅</div>

          <div>
            <span>Today's Follow-ups</span>
            <strong>{data.todayFollowUps}</strong>
          </div>
        </div>

      </div>

      {/* FOLLOW-UP SUMMARY */}
      <div className="panel">

        <div className="panel-title">
          Follow-up Overview
        </div>

        <div className="cards">

          <div className="card metric">
            <div className="icon-box">📅</div>

            <div>
              <span>Today</span>
              <strong>{data.todayFollowUps}</strong>
            </div>
          </div>

          <div className="card metric">
            <div className="icon-box">🔜</div>

            <div>
              <span>Upcoming</span>
              <strong>{data.upcomingFollowUps}</strong>
            </div>
          </div>

          <div className="card metric">
            <div className="icon-box">🚨</div>

            <div>
              <span>Overdue</span>
              <strong>{data.overdueFollowUps}</strong>
            </div>
          </div>

        </div>

      </div>

      {/* RECENT CHALLANS */}
      <div className="panel">

        <div className="panel-title">
          Recent Challans
        </div>

        {data.recentChallans?.length === 0 ? (
          <p className="muted">No challans found.</p>
        ) : (
          <table>

            <thead>
              <tr>
                <th>Number</th>
                <th>Customer</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>

              {data.recentChallans.map((challan: any) => (
                <tr key={challan.id}>

                  <td>
                    {challan.challanNumber}
                  </td>

                  <td>
                    {challan.customer?.businessName ||
                      challan.customer?.name ||
                      "-"}
                  </td>

                  <td>
                    {challan.totalQuantity}
                  </td>

                  <td>
                    ₹
                    {Number(challan.totalAmount || 0).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td>
                    <span
                      className={`badge ${challan.status.toLowerCase()}`}
                    >
                      {challan.status}
                    </span>
                  </td>

                  <td>
                    {new Date(
                      challan.createdAt
                    ).toLocaleDateString("en-IN")}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        )}

      </div>

      {/* LOW STOCK PRODUCTS */}
      <div className="panel">

        <div className="panel-title">
          Inventory Status
        </div>

        {data.lowStock === 0 ? (
          <div className="alert success">
            All products have healthy stock levels.
          </div>
        ) : (
          <div className="alert error">
            ⚠️ {data.lowStock} product
            {data.lowStock > 1 ? "s are" : " is"} at or below
            the minimum stock level.
          </div>
        )}

      </div>

      {/* TODAY'S FOLLOW UPS */}
      <div className="panel">

        <div className="panel-title">
          Today's Follow-ups
        </div>

        {data.todayFollowUpList?.length === 0 ? (
          <p className="muted">
            No follow-ups scheduled for today.
          </p>
        ) : (
          <table>

            <thead>
              <tr>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Note</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>

              {data.todayFollowUpList.map((followUp: any) => (
                <tr key={followUp.id}>

                  <td>
                    {followUp.customer?.businessName ||
                      followUp.customer?.name ||
                      "-"}
                  </td>

                  <td>
                    {followUp.customer?.mobile || "-"}
                  </td>

                  <td>
                    {followUp.note}
                  </td>

                  <td>
                    {new Date(
                      followUp.followUpDate
                    ).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        )}

      </div>

      {/* RECENT CUSTOMERS */}
      <div className="panel">

        <div className="panel-title">
          Recent Customers
        </div>

        {data.recentCustomers?.length === 0 ? (
          <p className="muted">
            No customers found.
          </p>
        ) : (
          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Business</th>
                <th>Type</th>
                <th>Status</th>
                <th>Mobile</th>
              </tr>
            </thead>

            <tbody>

              {data.recentCustomers.map((customer: any) => (
                <tr key={customer.id}>

                  <td>
                    {customer.name}
                  </td>

                  <td>
                    {customer.businessName}
                  </td>

                  <td>
                    {customer.type}
                  </td>

                  <td>
                    <span
                      className={`badge ${customer.status.toLowerCase()}`}
                    >
                      {customer.status}
                    </span>
                  </td>

                  <td>
                    {customer.mobile}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        )}

      </div>
    </>
  );
}