import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard as DashboardIcon, Receipt as InvoiceIcon, History as HistoryIcon, Inventory as ItemsIcon, Hotel as RoomIcon, Assessment as ActivityIcon, Analytics as ReportsIcon } from '@mui/icons-material';
import logo from './img/Rama Resort Logo White without BG .png';
const drawerWidth = 320;
const Dashboard = ({ onNavigateToDashboard, onNavigateToInvoice, onNavigateToList, onNavigateToItems, onNavigateToRooms, onNavigateToActivityLogs, onNavigateToReports, onLogout, currentUser, }) => {
    const [selectedItem, setSelectedItem] = useState('dashboard');
    // Base menu items available to all users
    const baseMenuItems = [
        {
            text: 'Dashboard',
            icon: _jsx(DashboardIcon, {}),
            id: 'dashboard',
            action: onNavigateToDashboard
        },
        {
            text: 'Create Invoice',
            icon: _jsx(InvoiceIcon, {}),
            id: 'invoice',
            action: onNavigateToInvoice
        },
        {
            text: 'Invoice History',
            icon: _jsx(HistoryIcon, {}),
            id: 'history',
            action: onNavigateToList
        },
        {
            text: 'Items Management',
            icon: _jsx(ItemsIcon, {}),
            id: 'items',
            action: onNavigateToItems
        },
        {
            text: 'Room Management',
            icon: _jsx(RoomIcon, {}),
            id: 'rooms',
            action: onNavigateToRooms
        }
    ];
    // Admin-only menu items
    const adminMenuItems = [
        {
            text: 'Activity Logs',
            icon: _jsx(ActivityIcon, {}),
            id: 'activity',
            action: onNavigateToActivityLogs
        },
        {
            text: 'Revenue Reports',
            icon: _jsx(ReportsIcon, {}),
            id: 'reports',
            action: onNavigateToReports
        }
    ];
    // Combine menu items based on user role
    const menuItems = currentUser.role === 'admin'
        ? [...baseMenuItems, ...adminMenuItems]
        : baseMenuItems;
    return (_jsxs(Drawer, { variant: "permanent", sx: {
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                color: '#333333',
                border: '1px solid #e2e8f0',
                boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)'
            },
        }, children: [_jsx(Box, { sx: {
                    p: 2,
                    borderBottom: '1px solid #e2e8f0',
                    // background: 'linear-gradient(135deg, #0B6623 0%, #0F5132 100%)',
                    textAlign: 'center'
                }, children: _jsx("img", { src: logo, alt: "Rama Resort Logo", style: {
                        width: '80px',
                        height: '100px',
                        marginBottom: '5px',
                        filter: 'brightness(0) invert(0)', // This will make the image black if it's an SVG or single-color PNG
                    } }) }), _jsx(List, { sx: { mt: 2 }, children: menuItems.map((item) => (_jsx(ListItem, { disablePadding: true, sx: { mb: 0.5 }, children: _jsxs(ListItemButton, { selected: selectedItem === item.id, onClick: () => {
                            setSelectedItem(item.id);
                            item.action();
                        }, sx: {
                            mx: 2,
                            borderRadius: 2,
                            color: selectedItem === item.id ? '#6366f1' : '#64748b',
                            backgroundColor: selectedItem === item.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            '&:hover': {
                                backgroundColor: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                color: '#6366f1'
                            },
                            '&.Mui-selected': {
                                backgroundColor: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                color: '#6366f1',
                                '&:hover': {
                                    backgroundColor: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                }
                            }
                        }, children: [_jsx(ListItemIcon, { sx: {
                                    color: 'inherit',
                                    minWidth: 40,
                                    '& .MuiSvgIcon-root': {
                                        fontSize: '1.2rem'
                                    }
                                }, children: item.icon }), _jsx(ListItemText, { primary: item.text, primaryTypographyProps: {
                                    fontSize: '0.9rem',
                                    fontWeight: selectedItem === item.id ? 600 : 400
                                } })] }) }, item.id))) }), _jsx(Box, { sx: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    borderTop: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc'
                }, children: _jsxs(ListItemButton, { onClick: onLogout, sx: {
                        borderRadius: 2,
                        color: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        '&:hover': {
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            color: '#dc2626'
                        }
                    }, children: [_jsx(ListItemIcon, { sx: {
                                color: 'inherit',
                                minWidth: 40,
                                '& .MuiSvgIcon-root': {
                                    fontSize: '1.2rem'
                                }
                            }, children: "\uD83D\uDEAA" }), _jsx(ListItemText, { primary: "Logout", primaryTypographyProps: {
                                fontSize: '0.9rem',
                                fontWeight: 600
                            } })] }) })] }));
};
export default Dashboard;
