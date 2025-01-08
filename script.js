// Function to fetch exchange rates, convert currency and find best conversion paths

async function convertCurrency() {
  
  const fromCurrency = document.getElementById("from-currency").value;
  const toCurrency = document.getElementById("to-currency").value;
  const amount = parseFloat(document.getElementById("amount").value);

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  // I have used ExchangeRate-API with fromCurrency as base currency
  const apiKey = "4b8b7d850e104bb5e46564cf";
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.result !== "success") {
      throw new Error("Failed to fetch exchange rates.");
    }
    
    const exchangeRate = data.conversion_rates;

    // for the converted amount in toCurrency
    const convertedAmount = (amount * exchangeRate[toCurrency]).toFixed(3);
    document.getElementById("converted-value").textContent = `${convertedAmount} ${toCurrency}`;
    
    //creating an array of possible conversions with 1 intermediate currency
    const bestPaths = [];
    for (let intermediateCurrency in exchangeRate) {
        if (
            intermediateCurrency !== toCurrency &&
            intermediateCurrency !== fromCurrency
        ) {
            // fromCurrency is base so relativeRateToIntermediate calculation not required, but added just in case
            const relativeRateToIntermediate = exchangeRate[intermediateCurrency]/ exchangeRate[fromCurrency];
            const relativeRateToTarget = exchangeRate[toCurrency] / exchangeRate[intermediateCurrency];
            
            const netRate = relativeRateToTarget * relativeRateToIntermediate;
            
            if (netRate > exchangeRate[toCurrency]) {
                const finalAmount = amount * netRate;
                
                if (finalAmount > 0 && finalAmount < 10000000000) { //to prevent absurd values - assuming input is quite less than 10 billion
                    bestPaths.push({
                        path: `${fromCurrency} → ${intermediateCurrency} → ${toCurrency}`,
                        value: finalAmount.toFixed(3),
                    });
                }
            }
        }
        
        bestPaths.sort((a, b) => b.value - a.value); //descending order
        
        const conversionPathsContainer =
        document.getElementById("conversion-paths");
        conversionPathsContainer.innerHTML = ""; // Clear existing paths
        
        
        // keeping the top 3 paths to parse through
        let toppaths = bestPaths.slice(0, 3);
        
        toppaths.forEach((pathObj) => {
            const pathItem = document.createElement("li");
            pathItem.textContent = `${pathObj.path}: ${pathObj.value} ${toCurrency}`;
            conversionPathsContainer.appendChild(pathItem);
        });
        
      //console.log("finished.")
    }
  } catch (error) {
    alert(error.message);
  }
}

//clear button program
document.getElementById("clear-button").addEventListener("click", () => {
    const inputField = document.getElementById("amount");
    inputField.value = "";
    const outputField = document.getElementById("converted-value");
    outputField.value = "";
});

//all console logs deleted or commented
