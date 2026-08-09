import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import CustomTabPanel from "@components/CustomTabPanel";
import UserProfileTab from "./UserProfileTab";
import UserChangePasswordTab from "./UserChangePasswordTab";
import { getBreadcrumbs } from './UserBreadcrumb.js';
import Grid from '@mui/material/Grid';
import { useTranslation } from 'react-i18next';
import MainCard from '@components/MainCard';
import Breadcrumb from '@components/Breadcrumb';
import UserInfo from './UserInfo'

export default function UserDetail({ id }) {
    const { t } = useTranslation('dashboard');
    const [tab, setTab] = useState(0);
    const breadcrumbs = getBreadcrumbs(t);

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ p: 3, pb: 0, mb: 0 }}>
                <Breadcrumb breadcrumbs={breadcrumbs} />
            </Box>

            <Grid container spacing={2}>
                <Grid size={3}>
                    <MainCard showBreadcrumb={false} sx={{ pt: 0, pr: 0 }}>
                        <UserInfo id={id} />
                    </MainCard>
                </Grid>
                <Grid size={9}>
                    <MainCard showBreadcrumb={false} sx={{ pt: 0, pl: 0 }}>
                        <Tabs
                            value={tab}
                            onChange={(_, v) => setTab(v)}
                            sx={{ borderBottom: 1, borderColor: "divider" }}
                        >
                            <Tab label="Personal Info" />
                            <Tab label="Change Password" />
                        </Tabs>

                        <CustomTabPanel value={tab} index={0}>
                            <UserProfileTab id={id} />
                        </CustomTabPanel>

                        <CustomTabPanel value={tab} index={1}>
                            <UserChangePasswordTab id={id} />
                        </CustomTabPanel>
                    </MainCard >
                </Grid>
            </Grid>
        </Box>
    );
}