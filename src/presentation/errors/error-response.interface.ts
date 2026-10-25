export interface ErrorResponseInterface {
  code: string;
  message: string;
  field?: string;
}

export interface ErrorsResponseInterface {
  errors: ErrorResponseInterface[];
}
