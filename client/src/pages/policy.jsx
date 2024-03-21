import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import policyPdf from '../components/policy.pdf'; // Import the PDF file
import '../styles/policy.css'; // Import the CSS file

function Policy() {
    return (
        <div className="policy-container">
            <div className="policy-bubble">
                <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                    <Viewer fileUrl={policyPdf} />
                </Worker>
            </div>
        </div>
    );
}

export default Policy;
