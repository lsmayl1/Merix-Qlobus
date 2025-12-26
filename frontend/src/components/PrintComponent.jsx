import React, { useRef } from "react";

export const PrintComponent = () => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const newWindow = window.open("", "", "width=1800,height=800");
    newWindow.document.writeln(`
		<html>
			<head>
				<title>Print</title>
				<style>
					/* Buraya istediğin stil ekleyebilirsin */
					body { font-family: Arial, sans-serif; text-align: center; font-size: 18px; items-align: center; display: flex; justify-content: center; align-items: center; flex-direction: column; padding: 20px; }
				</style>
			</head>
			<body>
				${printContent}
			</body>
		</html>
	`);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  };

  // ...existing code...
  return (
    <div>
      <div ref={printRef} className="flex  items-center justify-center gap-4">
        <h1 className="text-lg font-bold">Xirdalan 0.5L</h1>
        <p className="text-lg font-bold">5.50</p>
      </div>
      <button onClick={handlePrint}>Yazdır</button>
    </div>
  );
  // ...existing code...
};
