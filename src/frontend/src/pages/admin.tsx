import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { VerifyLogin } from "../utilities/utiliies";

import Feedback from '../components/feedback';

import Manage from "../components/ManageGallery"
import CreateEmployee from "../components/admin/CreateEmployee";
import Users from "../components/Users";
import ViewLogs from "../components/ViewLogs";

import type { Tab, UserData } from "../components/m_types";

export default function AdminPanel({ user } : { user: UserData }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const setTab = (tab: Tab) => {
        setSearchParams((params) => {
            params.set("tab", tab);
            return params;
        });
    };

    const [render, SetRender] = useState(false);
    
    useEffect(() => {
        const logic = async () => {
            const isValid = (await VerifyLogin() && user.role === "admin");
            SetRender(isValid);
            if (isValid) return;
            window.location.href = "/login";
        }
        logic();
    }, []);

    function toTab(value: string): Tab {
        if (value === "manage" || value === "create" || value === "users" || value === "logs") {
            return value;
        }
        return "create";
    }
    const [activeTab, SetActiveTab] = useState<Tab>(toTab(searchParams.get("tab") ?? "create"));

    // shared between all components/views of this panel
    const [success, SetSuccess] = useState(false);
    const [msg, SetMsg] = useState<string|undefined|null>("");
    const feedback = ( success: boolean, message: string ) => {
        SetSuccess(success);
        SetMsg(message);
        setTimeout(() => SetMsg(null), 3100);
    };

    return render && (
    <>
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1>Admin Panel</h1>
                    <p className="text-muted mb-0"> Manage gallery, employees, users, and logs. </p>
                </div>
                <span className="badge bg-danger"> Administrator </span>
            </div>
            
            <Feedback success={success} message={msg} />
            
            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${ activeTab === "manage" ? "active" : "" }`}
                        onClick={() => { SetActiveTab("manage"); setTab("manage"); }}
                    >
                        Manage Gallary
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${ activeTab === "create" ? "active" : "" }`}
                        onClick={() => { SetActiveTab("create"); setTab("create"); }}
                    >
                        Create Employee
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${ activeTab === "users" ? "active" : "" }`}
                        onClick={() => { SetActiveTab("users"); setTab("users"); }}
                    >
                        Users
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${ activeTab === "logs" ? "active" : "" }`}
                        onClick={() => { SetActiveTab("logs"); setTab("logs"); }}
                    >
                        Action Logs
                    </button>
                </li>
            </ul>
            
            {/* View */}
            {activeTab === "manage" && ( 
                <Manage user={user} feedback={feedback} />
            )} {activeTab === "create" && ( 
                <CreateEmployee feedback={feedback} />
            )} {activeTab === "users" && (
                <Users user={user} feedback={feedback} />
            )} {activeTab === "logs" && (
                <ViewLogs user={user} feedback={feedback} />
            )}
        </div>
    </>
    );
}