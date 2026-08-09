import DashboardLayout from '@layouts/DashboardLayout';
import Home from '@pages/dashboard/Home';
import Role from '@pages/Dashboard/Role/Role';
import Permission from '@pages/Dashboard/Permission/Permission';
import User from '@pages/Dashboard/User/User';
import PermissionMatrix from '@pages/Dashboard/PermissionMatrix/PermissionMatrix';
import Page from '@pages/Dashboard/Page/Page';
import Post from '@pages/Dashboard/Post/Post';
import Comment from '@pages/Dashboard/Comment/Comment';
import Category from '@pages/Dashboard/Category/Category';
import Tag from '@pages/Dashboard/Tag/Tag';
import Media from '@pages/Dashboard/Media/Media';

import Reports from '@pages/dashboard/Reports';
import Settings from '@pages/dashboard/Settings';
import Features from '@pages/dashboard/Features';
import DataTables from '@pages/dashboard/DataTables';
import Chat from '@pages/Dashboard/Chat';
import ChatGroup from '@pages/Dashboard/ChatGroup';
import VideoCall from '@pages/Dashboard/VideoCall';

import Calendar from '@pages/Dashboard/Calendar';

export const DashboardRoutes = [
    {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'user', element: <User /> },
            { path: 'page', element: <Page /> },
            { path: 'post', element: <Post /> },
            { path: 'comment', element: <Comment /> },
            { path: 'category', element: <Category /> },
            { path: 'tag', element: <Tag /> },
            { path: 'media', element: <Media /> },
            { path: 'permission-matrix', element: <PermissionMatrix /> },
            { path: 'role', element: <Role /> },
            { path: 'permission', element: <Permission /> },
            { path: 'features', element: <Features /> },
            { path: 'reports', element: <Reports /> },
            { path: 'settings', element: <Settings /> },
            { path: 'datatables', element: <DataTables /> },
            { path: 'chat', element: <Chat /> },
            { path: 'chat-group', element: <ChatGroup /> },
            { path: 'video-call', element: <VideoCall /> },
            { path: 'calendar', element: <Calendar /> }
        ]
    }
];
