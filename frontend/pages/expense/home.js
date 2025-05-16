"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaPlus, FaEye } from "react-icons/fa";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";

export default function Home() {
  const router = useRouter();
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState({});
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  const StarryBackground = dynamic(
    () => import("@/components/StarryBackground"),
    { ssr: false }
  );

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const startTime = Date.now();
      const response = await fetch("/api/employees");

      console.log("Fetch response:", {
        status: response.status,
        timeTaken: `${Date.now() - startTime}ms`,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Received employees:", data.employees);

      if (!Array.isArray(data.employees)) {
        throw new Error("Invalid employee data format");
      }

      setEmployees(data.employees);
      setError(null);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const toggleEmployeeDetails = (employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedRole = localStorage.getItem("userRole");

        if (!storedUser || !storedRole) {
          router.push("/expense/login");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser?.email) throw new Error("Invalid user data");

        setUserData({
          name: parsedUser.name,
          email: parsedUser.email,
          phone: parsedUser.phone || "N/A",
        });

        setUserRole(storedRole.toLowerCase());
      } catch (error) {
        console.error("Session load error:", error);
        router.push("/expense/login");
      }
    };
    loadUserData();
  }, [router]);
  const inventoryCards = [
    {
      id: 1,
      title: "Add Expense",
      Icon: FaPlus,
      colors: ["#2563eb", "#3b82f6", "#60a5fa"],
      route: "/expense/addExpense",
      image: "https://www.pngmart.com/files/8/Inventory-PNG-HD.png",
    },
    {
      id: 2,
      title: "View Expenses",
      Icon: FaEye,
      colors: ["#059669", "#10b981", "#34d399"],
      route: "/expense",
      image: "https://png.pngtree.com/png-clipart/20230825/original/pngtree-inventory-control-vector-warehouse-industry-picture-image_8773876.png",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-cover text-black relative overflow-hidden">
      <StarryBackground />
      <BackButton route="/dashboard" />
      <ScrollToTopButton />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat bg-[length:40px_40px]" />
      </div>

      <div className="flex flex-col items-center flex-grow p-6 pt-20 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold mb-16 text-center bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg"
        >
          Expense Management System
        </motion.h1>

        <div className="w-full max-w-7xl px-4">
          <motion.div
            className="flex gap-8 h-[500px] justify-center"
            animate={{ marginRight: isMenuOpen ? "16rem" : "0" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {inventoryCards.map((card) => (
              <motion.div
                key={card.id}
                className="relative rounded-3xl overflow-hidden cursor-pointer shadow-2xl group"
                initial={{ flex: 0.7 }}
                animate={{ flex: activeCard === card.id ? 2 : 0.7 }}
                onHoverStart={() => setActiveCard(card.id)}
                onHoverEnd={() => setActiveCard(null)}
                onClick={() => router.push(card.route)}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Glassmorphism Overlay */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-lg border border-white/10" />
                
                {/* Gradient Background */}
                <motion.div
                  className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(45deg, ${card.colors.join(', ')})`,
                  }}
                />

                {/* Animated Shine Effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -inset-24 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                    <div className="w-full h-full animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  </div>
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <motion.div
                    className="text-center"
                    animate={{ 
                      scale: activeCard === card.id ? 1.1 : 1,
                      y: activeCard === card.id ? -20 : 0
                    }}
                  >
                    <card.Icon className="text-5xl mb-6 text-white/90 drop-shadow-md" />
                    <motion.h2
                      className="text-3xl font-semibold text-white tracking-tight"
                      animate={{
                        fontSize: activeCard === card.id ? "2.25rem" : "1.875rem",
                      }}
                    >
                      {card.title}
                    </motion.h2>
                  </motion.div>

                  <motion.div
                    className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{ 
                      opacity: activeCard === card.id ? 1 : 0,
                      y: activeCard === card.id ? 0 : 20
                    }}
                  >
                    <p className="text-white/80 text-center text-lg">
                      {card.id === 1 
                        ? "Securely record new financial transactions"
                        : "Analyze and manage existing expense records"}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="w-full backdrop-blur-lg bg-white/5 border-t border-white/10 py-6 text-center mt-auto relative z-10">
        <p className="text-sm text-white/80 tracking-wide font-light">
          © {new Date().getFullYear()} Expense System • Secure Financial Management
        </p>
      </footer>

      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl w-96 shadow-2xl border border-white/10"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">
              Add New Employee
            </h2>
            <form onSubmit={handleAddEmployee}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-800 disabled:cursor-not-allowed"
                >
                  {formSubmitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
