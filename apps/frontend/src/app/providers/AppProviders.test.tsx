import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";

function Probe() {
  return <div>probe</div>;
}

describe("AppProviders", () => {
  it("renders children", () => {
    renderWithProviders(<Probe />);
    expect(screen.getByText("probe")).toBeInTheDocument();
  });
});
