import React from 'react';
import { X, Loader2 } from 'lucide-react';
import Button from '../Button';
import { getCartWithCartItemsApi } from '../../Api-Service/Apis';
import { useQuery } from '@tanstack/react-query';

interface CartModalProps {
  userId: string | number;
  vendorId: string | number | undefined;
  onClose: () => void;
}

export default function CartModal({ userId, vendorId, onClose }: CartModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['getCartWithCartItems', userId, vendorId],
    queryFn: () => getCartWithCartItemsApi(`?user_id=${userId}&vendor_id=${vendorId}`),
    enabled: !!userId && !!vendorId,
  });

  const cartItems = data?.data?.cart_items || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-6">
                Cart Items
              </h3>

              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 size={40} className="animate-spin text-blue-600" />
                </div>
              ) : cartItems.length > 0 ? (
                <div className="mt-2 flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg shadow-sm">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.product_details?.image_urls?.[0] || 'https://via.placeholder.com/150'}
                          alt={item.product_details?.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      
                      <div className="flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h4 className="line-clamp-2">{item.product_details?.name}</h4>
                            <p className="ml-4 whitespace-nowrap">₹{item.product_details?.price}</p>
                          </div>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm mt-2">
                          <p className="text-gray-500">Qty {item.quantity}</p>
                          {item.product_details?.status ? (
                             <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                In Stock
                             </span>
                          ) : (
                             <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                Out of Stock
                             </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-lg">Cart is empty</p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button onClick={onClose}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
