import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { AppProviders } from "../app/providers/AppProviders";

export function renderWithProviders(ui: ReactElement) {
  return render(<AppProviders>{ui}</AppProviders>);
}
