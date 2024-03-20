import React, { useState, useEffect } from 'react';
import policyPdf from '../components/policy.pdf'; // Import the PDF file
import '../styles/policy.css'; // Import the CSS file

function Policy() {
    const [pdfLoaded, setPdfLoaded] = useState(false);

    useEffect(() => {
        const preloadPdf = new Image();
        preloadPdf.src = policyPdf;
        preloadPdf.onload = () => setPdfLoaded(true);
    }, []);

    return (
        <div className="policy-container">
            {pdfLoaded ? (
                <div className="policy-bubble">
                    <object
                        type="application/pdf"
                        data={policyPdf}
                        width="100%"
                        height="100%"
                    >
                        <p>Your browser does not support PDFs.
                            <a href={policyPdf}>Download the PDF</a>.
                        </p>
                    </object>
                </div>
            ) : (
                <p>Loading PDF...</p>
            )}
        </div>
    );
}

export default Policy;
