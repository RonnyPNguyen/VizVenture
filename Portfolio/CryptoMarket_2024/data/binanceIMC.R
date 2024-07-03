setwd("~/Documents/Project/VizVenture/Portfolio/CryptoMarket_2024/data")
# libraries:
library(ggplot2)
library(gganimate)
library(hrbrthemes)
library(ggplot2)

# List of coins
coins <- c('bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple', 
           'cardano', 'avalanche-2', 'polkadot', 'chainlink', 
           'tron', 'dogecoin')

# Initialize an empty list for storing CAGRs
cagrList <- list()

# Loop through each coin
for (coin in coins) {
  # Construct file path
  file_path <- paste0("cryptodailyprice/", coin, ".csv")
  
  # Read the CSV file
  df <- read.csv(file_path)
  
  # Extract the price column
  prices <- df$price
  
  # Calculate the duration and number of years
  duration <- length(prices)
  years <- duration / 365
  
  # Calculate the CAGR
  cagr <- ((prices[duration] / prices[1])^(1/years) - 1) * 100
  
  # Append the CAGR to the list
  cagrList[[coin]] <- cagr
}

# Convert the list to a data frame for plotting
cagrDf <- data.frame(Coin = names(cagrList), CAGR = unlist(cagrList))

# Use ggplot2 to create a bar plot
ggplot(cagrDf, aes(x = Coin, y = CAGR, fill = Coin)) +
  geom_bar(stat = "identity") +
  theme_minimal(base_size = 14) +
  theme(
    plot.background = element_rect(fill = "transparent", colour = NA), # Transparent plot background
    panel.background = element_rect(fill = "transparent", colour = NA), # Transparent panel background
    legend.background = element_blank(), # Remove legend background
    axis.text.x = element_text(angle = 45, hjust = 1) # Adjust text angle
  ) +
  labs(title = "CAGR of Cryptocurrencies", x = "Cryptocurrency", y = "CAGR (%)")

# When saving the plot, ensure the background is set to transparent
ggsave("indexCagr.png", bg = "transparent")



