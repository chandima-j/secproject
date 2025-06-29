import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Leaf, Package, DollarSign, User, Phone, MessageCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleCallFarmer = (mobile) => {
    if (mobile) {
      window.location.href = `tel:${mobile}`;
    } else {
      alert('Mobile number not available for this farmer');
    }
  };

  const handleMessageFarmer = (mobile) => {
    if (mobile) {
      // For SMS
      window.location.href = `sms:${mobile}?body=Hi, I'm interested in your ${product?.name} from Fresh Bonds marketplace.`;
    } else {
      alert('Mobile number not available for this farmer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The product you\'re looking for doesn\'t exist.'}</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-green-600 hover:text-green-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 lg:h-full object-cover"
              />
              {product.organic && (
                <div className="absolute top-6 left-6 bg-green-500 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                  <Leaf className="h-4 w-4" />
                  <span>Certified Organic</span>
                </div>
              )}
              <div className="absolute top-6 right-6 bg-white bg-opacity-95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{product.price}</span>
                  <span className="text-gray-600">/{product.unit}</span>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    {product.category}
                  </span>
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-1" />
                    <span>{product.quantity} {product.unit}</span>
                  </div>
                  {product.inStock ? (
                    <span className="flex items-center text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      In Stock
                    </span>
                  ) : (
                    <span className="text-red-500">Out of Stock</span>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Farmer Information */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Farmer Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium mr-2">Name:</span>
                    <span>{product.farmerName}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{product.farmerLocation}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Harvested on {new Date(product.harvestDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Contact Farmer Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Farmer</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleCallFarmer(product.farmerMobile)}
                    disabled={!product.inStock}
                    className={`flex items-center justify-center py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      product.inStock
                        ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    {product.inStock ? 'Call Now' : 'Out of Stock'}
                  </button>
                  
                  <button
                    onClick={() => handleMessageFarmer(product.farmerMobile)}
                    disabled={!product.inStock}
                    className={`flex items-center justify-center py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      product.inStock
                        ? 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    {product.inStock ? 'Send Message' : 'Out of Stock'}
                  </button>
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  <p>Contact the farmer directly to arrange pickup or delivery</p>
                  {product.farmerMobile && (
                    <p className="mt-1 font-medium text-gray-700">
                      📞 {product.farmerMobile}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 text-center">
            <Leaf className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Fresh & Local</h3>
            <p className="text-sm text-gray-600">Harvested locally and delivered fresh to maintain quality and nutrition.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center">
            <User className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Direct from Farmer</h3>
            <p className="text-sm text-gray-600">Connect directly with local farmers and support your community.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center">
            <Phone className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Easy Contact</h3>
            <p className="text-sm text-gray-600">Call or message farmers directly to discuss your needs and arrange delivery.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;