import React from 'react';
import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';

interface InvoiceItem {
  description: string;
  unitPrice: number;
  quantity: number;
}

interface InvoiceGeneratorProps {
  invoice: Invoice;
  invoiceItems: InvoiceItem[];
  companyInfo: {
    companyName: string;
    companyAddress: string;
    bankName: string;
    bankAccountNumber: string;
  };
}

export function InvoiceGenerator({ invoice, invoiceItems, companyInfo }: InvoiceGeneratorProps) {
  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const calculateTax = (subtotal: number) => {
    return invoice.vat_rate ? (subtotal * invoice.vat_rate) / 100 : 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary">Invoice</h1>
          <p className="text-xl text-muted-foreground mt-2">RENT INVOICE</p>
        </div>
      </div>

      {/* Billing Information */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-muted-foreground font-semibold mb-2">BILLED TO:</h2>
          <p className="text-foreground">
            {invoice.tenant?.first_name} {invoice.tenant?.last_name}
          </p>
          <p className="text-muted-foreground">{invoice.tenant?.email}</p>
          <p className="text-foreground mt-2">{invoice.property?.address}</p>
        </div>
        <div>
          <h2 className="text-muted-foreground font-semibold mb-2">PAY TO:</h2>
          <p className="text-foreground">{companyInfo.companyName}</p>
          <p className="text-foreground">{companyInfo.companyAddress}</p>
          <p className="text-muted-foreground mt-2">Bank: {companyInfo.bankName}</p>
          <p className="text-muted-foreground">Account No: {companyInfo.bankAccountNumber}</p>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-muted-foreground">DESCRIPTION</th>
              <th className="text-left py-2 text-muted-foreground">UNIT PRICE</th>
              <th className="text-left py-2 text-muted-foreground">QTY</th>
              <th className="text-right py-2 text-muted-foreground">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 text-foreground">{item.description}</td>
                <td className="py-2 text-foreground">${item.unitPrice.toFixed(2)}</td>
                <td className="py-2 text-foreground">{item.quantity}</td>
                <td className="py-2 text-foreground text-right">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">SUBTOTAL</span>
            <span className="text-foreground">${calculateSubtotal().toFixed(2)}</span>
          </div>
          {invoice.vat_rate && (
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">VAT ({invoice.vat_rate}%)</span>
              <span className="text-foreground">${calculateTax(calculateSubtotal()).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t pt-2">
            <span>TOTAL</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">INVOICE NO: {invoice.id}</p>
            <p className="text-muted-foreground">
              DATE: {format(new Date(invoice.created_at), 'dd.MM.yyyy')}
            </p>
            <p className="text-muted-foreground">
              DUE DATE: {format(new Date(invoice.due_date), 'dd.MM.yyyy')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl text-primary font-bold">THANK YOU</p>
          </div>
        </div>
      </div>
    </div>
  );
}