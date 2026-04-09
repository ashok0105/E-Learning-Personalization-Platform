const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("./models/User");
const Course = require("./models/Course");
const Quiz = require("./models/Quiz");

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected for seeding");

        // Clear old quiz data
        await Quiz.deleteMany();
        console.log("🗑️  Cleared existing quizzes");

        // ===== ENSURE INSTRUCTOR EXISTS =====
        let instructor = await User.findOne({ role: "instructor" });
        if (!instructor) {
            const hashed = await bcrypt.hash("password123", 10);
            instructor = await User.create({
                name: "Prof. John Smith",
                email: "instructor@elpp.com",
                password: hashed,
                role: "instructor"
            });
            console.log("👤 Created instructor:", instructor.email);
        }

        // ===== ENSURE ADMIN EXISTS =====
        let admin = await User.findOne({ role: "admin" });
        if (!admin) {
            const hashed = await bcrypt.hash("admin123", 10);
            admin = await User.create({
                name: "Admin User",
                email: "admin@elpp.com",
                password: hashed,
                role: "admin"
            });
            console.log("🔐 Created admin:", admin.email);
        }

        // ===== SEED 3 COURSES =====
        let courses = await Course.find({ status: "Approved" });

        if (courses.length < 3) {
            // Delete existing to re-seed cleanly
            await Course.deleteMany();

            courses = await Course.insertMany([
                {
                    title: "Machine Learning Foundations",
                    description: "Comprehensive introduction to machine learning algorithms and practical applications using Python and scikit-learn.",
                    duration: "8 weeks",
                    category: "AI",
                    rating: 4.8,
                    students: 1240,
                    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
                    instructor: instructor._id,
                    status: "Approved",
                    price: 0
                },
                {
                    title: "Advanced React Development",
                    description: "Master React hooks, context API, Redux, and build production-ready full-stack web applications.",
                    duration: "6 weeks",
                    category: "Web",
                    rating: 4.6,
                    students: 980,
                    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop",
                    instructor: instructor._id,
                    status: "Approved",
                    price: 0
                },
                {
                    title: "Data Structures & Algorithms",
                    description: "Master fundamental data structures and algorithms needed for technical interviews and building efficient software.",
                    duration: "10 weeks",
                    category: "AI",
                    rating: 4.9,
                    students: 2100,
                    image: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&h=200&fit=crop",
                    instructor: instructor._id,
                    status: "Approved",
                    price: 0
                }
            ]);
            console.log(`📚 Seeded ${courses.length} courses`);
        }

        // ===== SEED QUIZZES FOR EACH COURSE =====
        for (const course of courses) {
            let questions = [];

            if (course.category === "AI" && course.title.includes("Machine Learning")) {
                questions = [
                    {
                        question: "What is Machine Learning?",
                        options: [
                            "A type of artificial intelligence that enables systems to learn from data",
                            "A programming language for data science",
                            "A database management system",
                            "A web development framework"
                        ],
                        correctAnswer: 0
                    },
                    {
                        question: "Which algorithm is used for classification problems?",
                        options: [
                            "Linear Regression",
                            "K-means Clustering",
                            "Logistic Regression",
                            "Principal Component Analysis"
                        ],
                        correctAnswer: 2
                    },
                    {
                        question: "What does overfitting mean in machine learning?",
                        options: [
                            "Model performs well on test data but poorly on training data",
                            "Model performs well on training data but poorly on test data",
                            "Model is too simple to capture patterns",
                            "Dataset is too large"
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: "Which metric is commonly used for classification?",
                        options: [
                            "Mean Squared Error",
                            "R-squared",
                            "Accuracy / F1-Score",
                            "Mean Absolute Error"
                        ],
                        correctAnswer: 2
                    },
                    {
                        question: "What is supervised learning?",
                        options: [
                            "Learning without labeled training data",
                            "Learning from labeled input-output pairs",
                            "Learning by rewards and penalties",
                            "Learning by clustering similar data"
                        ],
                        correctAnswer: 1
                    }
                ];
            } else if (course.title.includes("React")) {
                questions = [
                    {
                        question: "What is JSX in React?",
                        options: [
                            "A JavaScript extension for writing HTML-like code",
                            "A CSS framework for React",
                            "A database query language",
                            "A testing library"
                        ],
                        correctAnswer: 0
                    },
                    {
                        question: "What hook is used for side effects in React?",
                        options: ["useState", "useContext", "useEffect", "useReducer"],
                        correctAnswer: 2
                    },
                    {
                        question: "What is the virtual DOM?",
                        options: [
                            "A real DOM element",
                            "A lightweight copy of the actual DOM for performance",
                            "A CSS styling technique",
                            "A server-side rendering tool"
                        ],
                        correctAnswer: 1
                    },
                    {
                        question: "Which hook manages component state?",
                        options: ["useEffect", "useState", "useRef", "useMemo"],
                        correctAnswer: 1
                    },
                    {
                        question: "What does React.memo do?",
                        options: [
                            "Creates a new component instance",
                            "Prevents unnecessary re-renders of functional components",
                            "Manages global state",
                            "Handles async requests"
                        ],
                        correctAnswer: 1
                    }
                ];
            } else {
                questions = [
                    {
                        question: "What is the time complexity of binary search?",
                        options: ["O(n)", "O(n²)", "O(log n)", "O(n log n)"],
                        correctAnswer: 2
                    },
                    {
                        question: "Which data structure uses LIFO order?",
                        options: ["Queue", "Stack", "Linked List", "Heap"],
                        correctAnswer: 1
                    },
                    {
                        question: "What is a hash table?",
                        options: [
                            "A sorted array",
                            "A tree structure",
                            "A data structure that maps keys to values",
                            "A graph traversal"
                        ],
                        correctAnswer: 2
                    },
                    {
                        question: "Which sorting algorithm has O(n log n) best case?",
                        options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"],
                        correctAnswer: 2
                    },
                    {
                        question: "What is a queue used for?",
                        options: [
                            "LIFO data processing",
                            "FIFO data processing",
                            "Random access",
                            "Key-value storage"
                        ],
                        correctAnswer: 1
                    }
                ];
            }

            await Quiz.create({
                course: course._id,
                level: "beginner",
                questions
            });

            console.log(`📝 Quiz seeded for: "${course.title}" (ID: ${course._id})`);
        }

        console.log("\n===========================================");
        console.log("✅ SEED COMPLETE! Use these Course IDs:");
        courses.forEach(c => console.log(`   ${c.title}: ${c._id}`));
        console.log("===========================================\n");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding:", error.message);
        process.exit(1);
    }
};

seedDatabase();
