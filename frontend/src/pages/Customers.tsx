import { FormEvent, useEffect, useState } from "react";
import { api, apiError } from "../services/api";
import { useAuth } from "../context/AuthContext";

const empty = {
  name: "",
  mobile: "",
  email: "",
  businessName: "",
  gstNumber: "",
  type: "WHOLESALE",
  address: "",
  status: "LEAD",
  notes: "",
};

type FollowUpForm = {
  customerId: number | null;
  followUpId: number | null;
  customerName: string;
  businessName: string;
  followUpDate: string;
  note: string;
};

// =====================================================
// GET TODAY'S DATE
// =====================================================

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =====================================================
// CUSTOMERS
// =====================================================

export default function Customers() {
  const { user } = useAuth();

  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);
  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // FOLLOW-UP STATE
  // =====================================================

  const [showFollowUp, setShowFollowUp] =
    useState(false);

  const [followUpSaving, setFollowUpSaving] =
    useState(false);

  const [followUpForm, setFollowUpForm] =
    useState<FollowUpForm>({
      customerId: null,
      followUpId: null,
      customerName: "",
      businessName: "",
      followUpDate: getToday(),
      note: "",
    });

  // =====================================================
  // HISTORY STATE
  // =====================================================

  const [showHistory, setShowHistory] =
    useState(false);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [historyRows, setHistoryRows] =
    useState<any[]>([]);

  const [historyCustomer, setHistoryCustomer] =
    useState<any>(null);

  // =====================================================
  // LOAD CUSTOMERS
  // =====================================================

  async function load() {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(
        "/customers",
        {
          params: {
            search,
            limit: 50,
          },
        }
      );

      setRows(data.data || []);
    } catch (e) {
      console.error(
        "Load customers error:",
        e
      );

      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [search]);

  // =====================================================
  // ADD / UPDATE CUSTOMER
  // =====================================================

  async function save(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (editing !== null) {
        await api.put(
          `/customers/${editing}`,
          form
        );

        setSuccess(
          "Customer updated successfully"
        );
      } else {
        await api.post(
          "/customers",
          form
        );

        setSuccess(
          "Customer added successfully"
        );
      }

      setForm({ ...empty });
      setEditing(null);

      await load();
    } catch (e) {
      console.error(
        "Save customer error:",
        e
      );

      setError(apiError(e));
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // EDIT CUSTOMER
  // =====================================================

  function edit(row: any) {
    setError("");
    setSuccess("");

    setEditing(row.id);

    setForm({
      name: row.name || "",
      mobile: row.mobile || "",
      email: row.email || "",
      businessName:
        row.businessName || "",
      gstNumber: row.gstNumber || "",
      type: row.type || "WHOLESALE",
      address: row.address || "",
      status: row.status || "LEAD",
      notes: row.notes || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =====================================================
  // CANCEL CUSTOMER EDIT
  // =====================================================

  function cancelEdit() {
    setEditing(null);
    setForm({ ...empty });
    setError("");
  }

  // =====================================================
  // DELETE CUSTOMER
  // =====================================================

  async function deleteCustomer(
    id: number
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?\n\nAll follow-up records for this customer will also be deleted."
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/customers/${id}`
      );

      if (editing === id) {
        setEditing(null);
        setForm({ ...empty });
      }

      setSuccess(
        "Customer deleted successfully"
      );

      await load();
    } catch (e) {
      console.error(
        "Delete customer error:",
        e
      );

      setError(apiError(e));
    }
  }

  // =====================================================
  // OPEN ADD FOLLOW-UP MODAL
  // =====================================================

  function addFollowup(row: any) {
    setError("");
    setSuccess("");

    setFollowUpForm({
      customerId: row.id,
      followUpId: null,
      customerName: row.name,
      businessName:
        row.businessName,
      followUpDate: getToday(),
      note: "",
    });

    setShowFollowUp(true);
  }

  // =====================================================
  // SAVE FOLLOW-UP
  // ADD OR UPDATE
  // =====================================================

  async function saveFollowup(
    e: FormEvent
  ) {
    e.preventDefault();

    if (!followUpForm.customerId) {
      setError("Customer not selected");
      return;
    }

    if (!followUpForm.followUpDate) {
      setError(
        "Please select a follow-up date"
      );
      return;
    }

    if (!followUpForm.note.trim()) {
      setError(
        "Please enter a follow-up note"
      );
      return;
    }

    try {
      setFollowUpSaving(true);
      setError("");
      setSuccess("");

      // ---------------------------------------------
      // EDIT EXISTING FOLLOW-UP
      // ---------------------------------------------

      if (followUpForm.followUpId) {
        await api.patch(
          `/customers/followups/${followUpForm.followUpId}`,
          {
            note: followUpForm.note.trim(),
            followUpDate:
              followUpForm.followUpDate,
          }
        );

        setSuccess(
          "Follow-up updated successfully"
        );
      }

      // ---------------------------------------------
      // ADD NEW FOLLOW-UP
      // ---------------------------------------------

      else {
        await api.post(
          `/customers/${followUpForm.customerId}/followups`,
          {
            note: followUpForm.note.trim(),
            followUpDate:
              followUpForm.followUpDate,
          }
        );

        setSuccess(
          "Follow-up added successfully"
        );
      }

      setShowFollowUp(false);

      resetFollowUpForm();

      await load();

      // Refresh history if it is currently open
      if (
        showHistory &&
        followUpForm.customerId
      ) {
        await refreshHistory(
          followUpForm.customerId
        );
      }
    } catch (e) {
      console.error(
        "Save follow-up error:",
        e
      );

      setError(apiError(e));
    } finally {
      setFollowUpSaving(false);
    }
  }

  // =====================================================
  // RESET FOLLOW-UP FORM
  // =====================================================

  function resetFollowUpForm() {
    setFollowUpForm({
      customerId: null,
      followUpId: null,
      customerName: "",
      businessName: "",
      followUpDate: getToday(),
      note: "",
    });
  }

  // =====================================================
  // CLOSE FOLLOW-UP MODAL
  // =====================================================

  function closeFollowup() {
    if (followUpSaving) {
      return;
    }

    setShowFollowUp(false);
    resetFollowUpForm();
  }

  // =====================================================
  // OPEN FOLLOW-UP HISTORY
  // =====================================================

  async function openHistory(
    row: any
  ) {
    try {
      setError("");
      setSuccess("");
      setHistoryLoading(true);

      const { data } =
        await api.get(
          `/customers/${row.id}`
        );

      const customer = data.data;

      setHistoryCustomer(customer);
      setHistoryRows(
        customer.followUps || []
      );

      setShowHistory(true);
    } catch (e) {
      console.error(
        "Load follow-up history error:",
        e
      );

      setError(apiError(e));
    } finally {
      setHistoryLoading(false);
    }
  }

  // =====================================================
  // REFRESH HISTORY
  // =====================================================

  async function refreshHistory(
    customerId: number
  ) {
    try {
      setHistoryLoading(true);

      const { data } =
        await api.get(
          `/customers/${customerId}`
        );

      const customer = data.data;

      setHistoryCustomer(customer);
      setHistoryRows(
        customer.followUps || []
      );
    } catch (e) {
      console.error(
        "Refresh history error:",
        e
      );

      setError(apiError(e));
    } finally {
      setHistoryLoading(false);
    }
  }

  // =====================================================
  // COMPLETE FOLLOW-UP
  // =====================================================

  async function completeFollowup(
    followUp: any
  ) {
    const confirmed = window.confirm(
      "Mark this follow-up as completed?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.patch(
        `/customers/followups/${followUp.id}/complete`
      );

      setSuccess(
        "Follow-up completed successfully"
      );

      if (historyCustomer?.id) {
        await refreshHistory(
          historyCustomer.id
        );
      }

      await load();
    } catch (e) {
      console.error(
        "Complete follow-up error:",
        e
      );

      setError(apiError(e));
    }
  }

  // =====================================================
  // EDIT FOLLOW-UP
  // =====================================================

  function editFollowup(
    followUp: any
  ) {
    setError("");
    setSuccess("");

    const customer =
      historyCustomer;

    setFollowUpForm({
      customerId:
        customer?.id ||
        followUp.customerId ||
        null,

      followUpId: followUp.id,

      customerName:
        customer?.name || "",

      businessName:
        customer?.businessName || "",

      followUpDate:
        followUp.followUpDate
          ? new Date(
              followUp.followUpDate
            )
              .toISOString()
              .split("T")[0]
          : getToday(),

      note: followUp.note || "",
    });

    setShowFollowUp(true);
  }

  // =====================================================
  // DELETE FOLLOW-UP
  // =====================================================

  async function deleteFollowup(
    followUp: any
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this follow-up?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/customers/followups/${followUp.id}`
      );

      setSuccess(
        "Follow-up deleted successfully"
      );

      if (historyCustomer?.id) {
        await refreshHistory(
          historyCustomer.id
        );
      }

      await load();
    } catch (e) {
      console.error(
        "Delete follow-up error:",
        e
      );

      setError(apiError(e));
    }
  }

  // =====================================================
  // CLOSE HISTORY
  // =====================================================

  function closeHistory() {
    if (historyLoading) {
      return;
    }

    setShowHistory(false);
    setHistoryRows([]);
    setHistoryCustomer(null);
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(
    dateValue: string
  ) {
    if (!dateValue) {
      return "-";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateValue;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  // =====================================================
  // FORMAT DATE + TIME
  // =====================================================

  function formatDateTime(
    dateValue: string
  ) {
    if (!dateValue) {
      return "-";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateValue;
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      {/* =================================================
          PAGE TITLE
      ================================================= */}

      <div className="page-title">
        <div>
          <h2>Customers</h2>

          <p className="muted">
            CRM customer records and
            follow-ups.
          </p>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="alert success">
          {success}
        </div>
      )}

      {/* =================================================
          ADD / EDIT CUSTOMER
      ================================================= */}

      {(user?.role === "ADMIN" ||
        user?.role === "SALES") && (
        <form
          className="panel form-grid"
          onSubmit={save}
        >
          <div className="panel-title">
            {editing !== null
              ? "Edit Customer"
              : "Add Customer"}
          </div>

          {/* NAME */}

          <label>
            Name

            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </label>

          {/* MOBILE */}

          <label>
            Mobile

            <input
              required
              value={form.mobile}
              onChange={(e) =>
                setForm({
                  ...form,
                  mobile:
                    e.target.value,
                })
              }
            />
          </label>

          {/* EMAIL */}

          <label>
            Email

            <input
              required
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email:
                    e.target.value,
                })
              }
            />
          </label>

          {/* BUSINESS */}

          <label>
            Business

            <input
              required
              value={
                form.businessName
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  businessName:
                    e.target.value,
                })
              }
            />
          </label>

          {/* GST */}

          <label>
            GST (optional)

            <input
              value={
                form.gstNumber
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  gstNumber:
                    e.target.value,
                })
              }
            />
          </label>

          {/* TYPE */}

          <label>
            Type

            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                })
              }
            >
              <option value="RETAIL">
                RETAIL
              </option>

              <option value="WHOLESALE">
                WHOLESALE
              </option>

              <option value="DISTRIBUTOR">
                DISTRIBUTOR
              </option>
            </select>
          </label>

          {/* STATUS */}

          <label>
            Status

            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status:
                    e.target.value,
                })
              }
            >
              <option value="LEAD">
                LEAD
              </option>

              <option value="ACTIVE">
                ACTIVE
              </option>

              <option value="INACTIVE">
                INACTIVE
              </option>
            </select>
          </label>

          {/* ADDRESS */}

          <label className="wide">
            Address

            <textarea
              required
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address:
                    e.target.value,
                })
              }
            />
          </label>

          {/* NOTES */}

          <label className="wide">
            Notes

            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes:
                    e.target.value,
                })
              }
            />
          </label>

          {/* BUTTONS */}

          <div className="wide">
            <button
              className="primary"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editing !== null
                ? "Update"
                : "Add Customer"}
            </button>

            {editing !== null && (
              <button
                type="button"
                className="secondary"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* =================================================
          CUSTOMER TABLE
      ================================================= */}

      <div className="panel">

        {/* SEARCH */}

        <div className="toolbar">
          <input
            placeholder="Search customers..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* LOADING */}

        {loading ? (
          <p className="muted">
            Loading customers...
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
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "30px",
                    }}
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>

                    {/* NAME */}

                    <td>
                      {r.name}
                    </td>

                    {/* BUSINESS */}

                    <td>
                      {r.businessName}
                    </td>

                    {/* TYPE */}

                    <td>
                      {r.type}
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`badge ${String(
                          r.status
                        ).toLowerCase()}`}
                      >
                        {r.status}
                      </span>
                    </td>

                    {/* MOBILE */}

                    <td>
                      {r.mobile}
                    </td>

                    {/* ACTIONS */}

                    <td>

                      {/* EDIT CUSTOMER */}

                      <button
                        type="button"
                        className="link-btn"
                        onClick={() =>
                          edit(r)
                        }
                      >
                        Edit
                      </button>

                      {(user?.role ===
                        "ADMIN" ||
                        user?.role ===
                          "SALES") && (
                        <>
                          {/* ADD FOLLOW-UP */}

                          <button
                            type="button"
                            className="link-btn"
                            onClick={() =>
                              addFollowup(
                                r
                              )
                            }
                          >
                            Follow-up
                          </button>

                          {/* HISTORY */}

                          <button
                            type="button"
                            className="link-btn"
                            onClick={() =>
                              openHistory(
                                r
                              )
                            }
                          >
                            History
                          </button>

                          {/* DELETE CUSTOMER */}

                          <button
                            type="button"
                            className="link-btn delete-btn"
                            onClick={() =>
                              deleteCustomer(
                                r.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ==================================================
          ADD / EDIT FOLLOW-UP MODAL
      ================================================== */}

      {showFollowUp && (
        <div className="modal-overlay">

          <div className="modal">

            {/* HEADER */}

            <div className="modal-header">

              <div>
                <h3>
                  {followUpForm.followUpId
                    ? "Edit Follow-up"
                    : "Add Follow-up"}
                </h3>

                <p className="muted">
                  {followUpForm.followUpId
                    ? "Update or reschedule this follow-up."
                    : "Record a customer follow-up activity."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeFollowup
                }
                disabled={
                  followUpSaving
                }
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                saveFollowup
              }
            >

              {/* CUSTOMER */}

              <div className="customer-preview">

                <div>
                  <span className="field-label">
                    Customer
                  </span>

                  <strong>
                    {
                      followUpForm.customerName
                    }
                  </strong>
                </div>

                <div>
                  <span className="field-label">
                    Business
                  </span>

                  <strong>
                    {
                      followUpForm.businessName
                    }
                  </strong>
                </div>

              </div>

              {/* DATE */}

              <label>
                Follow-up Date

                <input
                  type="date"
                  required
                  value={
                    followUpForm.followUpDate
                  }
                  onChange={(e) =>
                    setFollowUpForm({
                      ...followUpForm,
                      followUpDate:
                        e.target
                          .value,
                    })
                  }
                />
              </label>

              {/* NOTE */}

              <label>
                Note

                <textarea
                  required
                  rows={5}
                  placeholder="Enter follow-up details..."
                  value={
                    followUpForm.note
                  }
                  onChange={(e) =>
                    setFollowUpForm({
                      ...followUpForm,
                      note:
                        e.target
                          .value,
                    })
                  }
                />
              </label>

              {/* BUTTONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary"
                  onClick={
                    closeFollowup
                  }
                  disabled={
                    followUpSaving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={
                    followUpSaving
                  }
                >
                  {followUpSaving
                    ? "Saving..."
                    : followUpForm.followUpId
                    ? "Update Follow-up"
                    : "Save Follow-up"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* ==================================================
          FOLLOW-UP HISTORY MODAL
      ================================================== */}

      {showHistory && (
        <div className="modal-overlay">

          <div className="modal">

            {/* HEADER */}

            <div className="modal-header">

              <div>
                <h3>
                  Follow-up History
                </h3>

                <p className="muted">
                  Previous follow-up
                  activities for this
                  customer.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeHistory
                }
              >
                ×
              </button>

            </div>

            {/* CUSTOMER INFORMATION */}

            {historyCustomer && (
              <div className="customer-preview">

                <div>
                  <span className="field-label">
                    Customer
                  </span>

                  <strong>
                    {
                      historyCustomer.name
                    }
                  </strong>
                </div>

                <div>
                  <span className="field-label">
                    Business
                  </span>

                  <strong>
                    {
                      historyCustomer.businessName
                    }
                  </strong>
                </div>

              </div>
            )}

            {/* LOADING */}

            {historyLoading && (
              <p className="muted">
                Loading follow-up
                history...
              </p>
            )}

            {/* EMPTY HISTORY */}

            {!historyLoading &&
              historyRows.length ===
                0 && (
                <div className="panel">
                  <p className="muted">
                    No follow-ups have
                    been recorded for
                    this customer.
                  </p>
                </div>
              )}

            {/* HISTORY LIST */}

            {!historyLoading &&
              historyRows.length >
                0 && (
                <div
                  className="followup-history"
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap: "12px",
                    marginTop:
                      "20px",
                  }}
                >

                  {historyRows.map(
                    (
                      followUp: any
                    ) => (
                      <div
                        key={
                          followUp.id
                        }
                        className="followup-history-item"
                        style={{
                          padding:
                            "16px",
                          border:
                            "1px solid #e2e8f0",
                          borderRadius:
                            "10px",
                          background:
                            "#f8fafc",
                        }}
                      >

                        {/* TOP ROW */}

                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            gap:
                              "12px",
                            marginBottom:
                              "10px",
                            flexWrap:
                              "wrap",
                          }}
                        >

                          {/* DATE */}

                          <div
                            style={{
                              fontWeight:
                                700,
                              color:
                                "#1e3a8a",
                            }}
                          >
                            Follow-up Date:{" "}
                            {formatDate(
                              followUp.followUpDate
                            )}
                          </div>

                          {/* STATUS */}

                          <span
                            className={`badge ${
                              followUp.status ===
                              "COMPLETED"
                                ? "confirmed"
                                : "draft"
                            }`}
                          >
                            {followUp.status ||
                              "PENDING"}
                          </span>

                        </div>

                        {/* NOTE */}

                        <div
                          style={{
                            fontSize:
                              "15px",
                            color:
                              "#334155",
                            marginBottom:
                              "8px",
                            whiteSpace:
                              "pre-wrap",
                          }}
                        >
                          {followUp.note}
                        </div>

                        {/* CREATED DATE */}

                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#64748b",
                            marginBottom:
                              "12px",
                          }}
                        >
                          Created:{" "}
                          {formatDateTime(
                            followUp.createdAt
                          )}
                        </div>

                        {/* ACTION BUTTONS */}

                        {(user?.role ===
                          "ADMIN" ||
                          user?.role ===
                            "SALES") && (
                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "12px",
                              flexWrap:
                                "wrap",
                            }}
                          >

                            {/* COMPLETE */}

                            {followUp.status !==
                              "COMPLETED" && (
                              <button
                                type="button"
                                className="link-btn"
                                onClick={() =>
                                  completeFollowup(
                                    followUp
                                  )
                                }
                              >
                                Complete
                              </button>
                            )}

                            {/* EDIT */}

                            {followUp.status !==
                              "COMPLETED" && (
                              <button
                                type="button"
                                className="link-btn"
                                onClick={() =>
                                  editFollowup(
                                    followUp
                                  )
                                }
                              >
                                Edit
                              </button>
                            )}

                            {/* DELETE */}

                            <button
                              type="button"
                              className="link-btn danger"
                              onClick={() =>
                                deleteFollowup(
                                  followUp
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>
                        )}

                      </div>
                    )
                  )}

                </div>
              )}

            {/* CLOSE */}

            <div className="modal-actions">

              <button
                type="button"
                className="secondary"
                onClick={
                  closeHistory
                }
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