import React, { useState, useContext } from 'react'; // Added useContext
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import { API_PATHS } from '../../utils/apiPaths';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';

// Import your axios instance and the uploadImage tool we created earlier
import axiosInstance from '../../utils/axiosInstance'; 
import uploadImage from '../../utils/uploadImage'; 
// IMPORTANT: Removed the backend middleware import as it's not allowed in frontend

// Assuming you have a UserContext defined somewhere
// import { UserContext } from '../../context/UserContext'; 

const SignUp = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    // Ensure these names match your Context provider
    // const { updateUser } = useContext(UserContext); 
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        let profileImageUrl = "";

        if (!fullName) {
            setError("Please enter your name");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!password) {
            setError("Please enter the password");
            return;
        }

        setError("");

        try {
            // 1. Upload image if it exists
            if (profilePic) {
                const imgUploadRes = await uploadImage(profilePic);
                profileImageUrl = imgUploadRes.imageUrl || "";
            }

            // 2. Register User
            const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
                fullName,
                email,
                password,
                profileImageUrl
            });

            const { token, user } = response.data;

            if (token) {
                localStorage.setItem("token", token);
                // updateUser(user); // Uncomment if using Context
                navigate("/dashboard");
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <AuthLayout>
            <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-black">Create an Account</h3>
                <p className="text-xs text-slate-700 mt-[5px] mb-6">
                    Join us today by entering your details below.
                </p>

                <form onSubmit={handleSignUp}>
                    <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            value={fullName}
                            onChange={({ target }) => setFullName(target.value)}
                            label="Full Name"
                            placeholder="John"
                            type="text"
                        />

                        <Input
                            value={email}
                            onChange={({ target }) => setEmail(target.value)}
                            label="Email Address"
                            placeholder="john@example.com"
                            type="text"
                        />

                        <div className="col-span-2">
                            <Input
                                value={password}
                                onChange={({ target }) => setPassword(target.value)}
                                label="Password"
                                placeholder="Min 8 Characters"
                                type="password"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-xs pb-1 mt-2">{error}</p>}

                    <button type="submit" className="btn-primary mt-4">
                        CREATE ACCOUNT
                    </button>

                    <p className="text-sm text-center mt-4">
                        Already have an account?{" "}
                        <Link to="/login" className="font-medium text-primary underline">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </AuthLayout>
    );
};

export default SignUp;