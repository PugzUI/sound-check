import { render, screen } from "@testing-library/react";
import React from "react";
import App from "../App";

describe("App smoke test", () => {
  it("renders empty state and primary controls", () => {
    render(<App />);

    expect(screen.getByText(/drop audio files here or click to browse/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /browse files/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /analyze/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    expect(screen.getByText(/ready/i)).toBeInTheDocument();
  });
});

