export type ErrorPageContext = {
  label: string;
  value: string;
};

export type ErrorPageDiagnostic = {
  label: string;
  value: string;
};

export type NormalizedErrorDisplay = {
  title: string;
  description: string;
  diagnostics: ErrorPageDiagnostic[];
};
