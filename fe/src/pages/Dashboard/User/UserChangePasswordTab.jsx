import {
    Stack,
    TextField,
    Button,
    IconButton,
    InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

export default function UserChangePasswordTab() {
    const [show, setShow] = useState(false);

    const { control, handleSubmit } = useForm({
        defaultValues: {
            old_password: "",
            new_password: "",
            confirm_password: "",
        },
    });

    const onSubmit = (data) => {
        console.log("Password:", data);
    };

    return (
        <Stack
            maxWidth={420}
            spacing={2.5}
            component="form"
            onSubmit={handleSubmit(onSubmit)}
        >
            <Controller
                name="old_password"
                control={control}
                render={({ field }) => (
                    <TextField {...field} label="Old Password" type="password" fullWidth size="small" />
                )}
            />

            <Controller
                name="new_password"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="New Password"
                        type={show ? "text" : "password"}
                        fullWidth
                        size="small"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShow(!show)}>
                                        {show ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                )}
            />

            <Controller
                name="confirm_password"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        size="small"
                    />
                )}
            />

            <Button type="submit" variant="contained" size="small" sx={{ width: 200 }}>
                Update Password
            </Button>
        </Stack>
    );
}