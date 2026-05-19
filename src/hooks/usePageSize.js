import { useEffect, useState } from "react";

export default function usePageSize(defaultValue = 10) {
  const [pageSize, setPageSize] =
    useState(defaultValue);

  useEffect(() => {
    function updatePageSize() {
      const height = window.innerHeight;

      if (height >= 1400) {
        setPageSize(20);
      } else if (height >= 1000) {
        setPageSize(10);
      } else {
        setPageSize(5);
      }
    }

    updatePageSize();

    window.addEventListener(
      "resize",
      updatePageSize
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePageSize
      );
    };
  }, []);

  return [pageSize, setPageSize];
}
