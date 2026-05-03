import { prisma } from '@/lib/prisma';
import React from 'react';

export default async function StockDashboard() {
  const products = await prisma.product.findMany({
    include: {
      predictions: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Stock Management & Prediction Dashboard</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-3 px-4 border-b">Product</th>
              <th className="py-3 px-4 border-b">Current Stock</th>
              <th className="py-3 px-4 border-b">Minimum Stock</th>
              <th className="py-3 px-4 border-b">Status</th>
              <th className="py-3 px-4 border-b">Predicted Depletion</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isLowStock = product.currentStock <= product.minimumStock;
              const prediction = product.predictions[0];
              
              return (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{product.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {product.currentStock}
                    </span>
                  </td>
                  <td className="py-3 px-4">{product.minimumStock}</td>
                  <td className="py-3 px-4">
                    {isLowStock ? 'Needs Reorder' : 'Healthy'}
                  </td>
                  <td className="py-3 px-4">
                    {prediction ? new Date(prediction.predictedDate).toLocaleDateString() : 'Not enough data'}
                  </td>
                </tr>
              );
            })}
            
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No products found. Add products to see stock predictions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
