# Bollinger Bands Indicator with KLineCharts

This is a Next.js application that provides Bollinger Bands indicator integrated with the KLineCharts library. The goal was to create a responsive, configurable charting module that mimics the user experience of professional trading platforms like TradingView.

## Features

* **Interactive Candlestick Chart**: Renders OHLCV data using `klinecharts`.
* **Dynamic Bollinger Bands Indicator**: Overlay a fully functional Bollinger Bands indicator on the chart.
* **Comprehensive Settings Panel**:
    * **Inputs Tab**: Configure `Length`, `Standard Deviation (StdDev)`, and `Offset`.
    * **Style Tab**: Customize the visibility, color, line width, and line style (solid/dashed) for the Basis, Upper, and Lower bands.
    * **Background Fill**: Toggle and adjust the color and opacity of the area between the upper and lower bands.
* **Real-time Updates**: All changes in the settings panel are reflected on the chart instantly without a page refresh.
* **Built with Modern Tech**: Developed using Next.js, React, TypeScript, and styled with Tailwind CSS.

## Tech Stack

* **Framework**: Next.js 15
* **Language**: TypeScript
* **Styling**: Tailwind CSS 4
* **Charting Library**: `klinecharts` version 9.8.0

---

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

* Node.js (v18.18 or later)
* npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Implementation Notes & Formulas

The Bollinger Bands were calculated using the standard formulas as specified.

* **Basis (Middle Band)**: A Simple Moving Average (SMA) of the source data over a given length.
    `Basis = SMA(close, length)`

* **Standard Deviation**: The **Population Standard Deviation** was used for the calculation. This is because we are analyzing the specific `length` of data as the entire population for that window.
    `StdDev = PopulationStandardDeviation(close, length)`

* **Upper Band**: The basis plus the standard deviation multiplied by a user-defined multiplier.
    `Upper = Basis + (StdDev * stdDevMultiplier)`

* **Lower Band**: The basis minus the standard deviation multiplied by the multiplier.
    `Lower = Basis - (StdDev * stdDevMultiplier)`

* **Offset**: The three series (Basis, Upper, Lower) are shifted forward (positive offset) or backward (negative offset) on the chart by the specified number of bars.

---
