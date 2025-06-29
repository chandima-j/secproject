import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Leaf, Phone, MessageCircle } from 'lucide-react';

const ProductCard = ({ product }) => {
  const handleCallFarmer = (e, mobile) => {
    e.preventDefault();
    e.stopPropagation();
    if (mobile) {
      window.location.href = `tel:${mobile}`;
    } else {
      alert('Mobile number not available for this farmer');
    }
  };

  const handleMessageFarmer = (e, mobile) => {
    e.preventDefault();
    e.stopPropagation();
    if (mobile) {
      window.location.href = `sms:${mobile}?body=Hi, I'm interested in your ${product?.name} from Fresh Bonds marketplace.`;
    } else {
      alert('Mobile number not available for this farmer');
    }
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.organic && (
            <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Leaf className="h-3 w-3" />
              <span>Organic</span>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-lg">
            <span className="text-lg font-bold text-green-600">${product.price}</span>
            <span className="text-sm text-gray-600">/{product.unit}</span>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        </Link>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{product.farmerName} • {product.farmerLocation}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Harvested {new Date(product.harvestDate).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">{product.quantity} {product.unit}</span>
              {product.inStock ? (
                <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
              ) : (
                <span className="ml-2 text-xs text-red-500">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Contact Farmer Buttons */}
          {product.inStock && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex space-x-2">
                <button
                  onClick={(e) => handleCallFarmer(e, product.farmerMobile)}
                  className="flex-1 flex items-center justify-center py-2 px-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  title="Call Farmer"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </button>
                <button
                  onClick={(e) => handleMessageFarmer(e, product.farmerMobile)}
                  className="flex-1 flex items-center justify-center py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  title="Message Farmer"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </button>
              </div>
              {product.farmerMobile && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  📞 {product.farmerMobile}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;