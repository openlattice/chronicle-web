// @flow

export default function copyToClipboard(value :?string) {
  if (navigator.clipboard && value) {
    navigator.clipboard.writeText(value);
  }
}
