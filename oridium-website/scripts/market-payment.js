document.addEventListener("DOMContentLoaded", () => {
  const buyButton = document.querySelector(".market-buy-button");

  if (!buyButton) return;

  buyButton.addEventListener("click", async () => {
    try {
      const wallet = localStorage.getItem("oridium_wallet") || prompt("Enter your wallet address:");
      const amount = parseFloat(document.querySelector(".market-buy-input").value) || 1;

      if (!wallet || amount <= 0) {
        alert("Invalid wallet or amount.");
        return;
      }

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, amount })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("❌ Failed to create payment link");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Payment failed");
    }
  });
});