import * as React from "react";

const Box = (props) => {
  return (
    <svg
      width={30}
      height={31}
      viewBox="0 0 30 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_133_34)">
        <path
          d="M2.70117 8.91162L15 16.0291L27.2154 8.95341"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 28.6486V16.0154"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.1169 2.00333L4.67903 6.12619C2.99367 7.0594 1.61475 9.3994 1.61475 11.3215V19.1911C1.61475 21.1133 2.99367 23.4533 4.67903 24.3865L12.1169 28.5233C13.7047 29.4008 16.3094 29.4008 17.8972 28.5233L25.3351 24.3865C27.0204 23.4533 28.3994 21.1133 28.3994 19.1911V11.3215C28.3994 9.3994 27.0204 7.0594 25.3351 6.12619L17.8972 1.9894C16.2954 1.1119 13.7047 1.1119 12.1169 2.00333Z"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath>
          <rect
            width={30}
            height={30}
            fill="currentColor"
            transform="translate(0 0.263184)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default Box;
