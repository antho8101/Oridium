console.log("🔐 orid-session.js loaded");

async function setOridSession(address, pseudo) {
  try {
    const res = await fetch("https://api.getoridium.com/api/set-session", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ address, pseudo })
    });

    if (!res.ok) throw new Error("Failed to set session");
    console.log("✅ Session saved with cookie");
  } catch (err) {
    console.error("❌ Failed to set session:", err);
  }
}

async function clearOridSession() {
  try {
    // Supprimer côté client
    document.cookie = "orid_session=; Max-Age=0; path=/; domain=.getoridium.com; secure";

    // Supprimer côté serveur
    await fetch("https://api.getoridium.com/api/logout", {
      method: "POST",
      credentials: "include"
    });

    console.log("🧹 Session cleared");
  } catch (err) {
    console.error("❌ Failed to clear session:", err);
  }
}