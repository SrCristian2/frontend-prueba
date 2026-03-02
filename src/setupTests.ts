import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

Object.assign(global, { TextEncoder, TextDecoder });

process.env.VITE_API_URL = "http://localhost:3000/api/v1";
process.env.VITE_WOMPI_PUBLIC_KEY = "pub_test_key";
