const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:4000/api";

function buildHeaders(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function api(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(token),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Request failed for ${path}`);
  }
  return data;
}

async function run() {
  const unique = Date.now();
  const userRoll = `99${String(unique).slice(-8)}`;
  const adminRoll = `98${String(unique).slice(-8)}`;
  const password = "Test@12345";

  const health = await api("/health");
  if (!health?.ok) {
    throw new Error("Health check failed");
  }

  await api("/auth/register/user", {
    method: "POST",
    body: {
      name: "DB Test User",
      email: `dbtestuser${unique}@chitkara.edu.in`,
      rollNumber: userRoll,
      password,
    },
  });

  await api("/auth/register/admin", {
    method: "POST",
    body: {
      name: "DB Test Admin",
      email: `dbtestadmin${unique}@chitkara.edu.in`,
      rollNumber: adminRoll,
      password,
    },
  });

  const userLogin = await api("/auth/login/user", {
    method: "POST",
    body: { rollNumber: userRoll, password },
  });

  const adminLogin = await api("/auth/login/admin", {
    method: "POST",
    body: { rollNumber: adminRoll, password },
  });

  const userToken = userLogin.token;
  const adminToken = adminLogin.token;

  if (!userToken || !adminToken) {
    throw new Error("JWT token missing from login response");
  }

  const complaints = await api("/complaints", { token: userToken });
  const adminComplaints = await api("/admin/complaints", { token: adminToken });
  const lost = await api("/lost-found/lost", { token: userToken });
  const found = await api("/lost-found/found", { token: userToken });

  if (!Array.isArray(complaints)) {
    throw new Error("Complaints endpoint did not return an array");
  }
  if (!Array.isArray(adminComplaints)) {
    throw new Error("Admin complaints endpoint did not return an array");
  }
  if (!Array.isArray(lost) || !Array.isArray(found)) {
    throw new Error("Lost/found endpoints did not return arrays");
  }

  if (complaints.length > 0) {
    const sample = complaints[0];
    if (!sample.complaint_id || !sample.user_id) {
      throw new Error("Complaint payload shape mismatch");
    }

    const user = await api(`/users/${sample.user_id}`, {
      token: sample.user_id === userRoll ? userToken : adminToken,
    });
    if (!user?.rollNumber) {
      throw new Error("User endpoint payload shape mismatch");
    }

    const userComplaints = await api(`/users/${sample.user_id}/complaints`, {
      token: sample.user_id === userRoll ? userToken : adminToken,
    });
    if (!Array.isArray(userComplaints)) {
      throw new Error("User complaints endpoint did not return an array");
    }
  }

  console.log("DB API smoke tests passed", {
    complaints: complaints.length,
    adminComplaints: adminComplaints.length,
    lost: lost.length,
    found: found.length,
  });
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
