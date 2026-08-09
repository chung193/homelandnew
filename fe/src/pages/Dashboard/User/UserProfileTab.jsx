import {
    Box,
    Stack,
    TextField,
    Button,
    Avatar,
    IconButton,
    Checkbox,
    FormControlLabel,
    Grid
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

import { show, uploadAvatar, update } from "./UserServices";

export default function UserProfileTab({ id }) {
    const [preview, setPreview] = useState("");

    const { control, reset, handleSubmit, setValue } = useForm({
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            is_active: "",
            city: "",
            position: "",
            website: "",
            github: "",
            birthday: "",
            join_date: "",
            address: "",
            description: "",
            avatar: null,
        },
    });

    useEffect(() => {
        if (!id) return;

        show(id)
            .then((res) => {
                const u = res.data.data;
                reset({
                    name: u.name,
                    email: u.email,
                    phone: u.detail.phone,
                    address: u.detail.address,
                    city: u.detail.city,
                    is_active: u.is_active,
                    birthday: u.detail.birthday,
                    join_date: u.detail.join_date,
                    website: u.detail.website,
                    github: u.detail.github,
                    position: u.detail.position,
                    description: u.detail.description,
                });

                if (u.avatar) setPreview(u.avatar);
            });
    }, [id]);

    const onSubmit = (data) => {
        console.log("Profile:", data);
        update(id, data)
            .then(res => {
                console.log(res)
            })
            .catch(err => {
                console.log(err)
            })
    };

    const handleAvatar = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setValue("avatar", file);
        setPreview(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("file", file);
        formData.append("model", 'User');
        formData.append("id", id);
        formData.append("collection", 'avatar');
        uploadAvatar(formData)
            .then(res => { console.log(res) })
            .catch(err => console.log(err))
    };

    return (
        <Box sx={{ width: "100%" }}>

            {/* Avatar */}
            <Box
                textAlign="center"
                position="relative"
                sx={{ mb: 3 }}
            >
                <Avatar
                    src={preview}
                    sx={{
                        width: 120,
                        height: 120,
                        mx: "auto",
                        border: "4px solid #2c3e50",
                    }}
                />

                <input hidden id="upload" type="file" onChange={handleAvatar} />

                <label htmlFor="upload">
                    <IconButton
                        component="span"
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            left: "50%",
                            transform: "translateX(25px)",
                            bgcolor: "background.paper",
                        }}
                    >
                        <PhotoCamera />
                    </IconButton>
                </label>
            </Box>

            {/* Form */}
            <Box sx={{ width: "100%" }} component="form" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>

                    {/* Row 1 */}
                    <Grid item xs={12} size={6}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Full Name" fullWidth size="small" />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} size={6}>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Email" fullWidth size="small" />
                            )}
                        />
                    </Grid>

                    {/* Row 2 */}
                    <Grid item xs={12} size={6}>
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Phone" fullWidth size="small" />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} size={6}>
                        <Controller
                            name="address"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Address" fullWidth size="small" />
                            )}
                        />
                    </Grid>

                    {/* Row 3 */}
                    <Grid item xs={12} size={6}>
                        <Controller
                            name="city"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="City" fullWidth size="small" />
                            )}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        size={6}
                        sx={{ display: "flex", alignItems: "center" }}
                    >
                        <Controller
                            name="is_active"
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                                <FormControlLabel
                                    label={field.value ? "Hoạt động" : "Khóa"}
                                    control={
                                        <Checkbox
                                            checked={!!field.value}
                                            onChange={(e) =>
                                                field.onChange(e.target.checked)
                                            }
                                        />
                                    }
                                />
                            )}
                        />
                    </Grid>

                    {/* Row 4 */}
                    <Grid item xs={12} size={6}>
                        <Controller
                            name="position"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Position" fullWidth size="small" />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} size={6}>
                        <Controller
                            name="website"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Website" fullWidth size="small" />
                            )}
                        />
                    </Grid>

                    {/* Row 5 */}
                    <Grid item xs={12} size={6}>
                        <Controller
                            name="github"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Github" fullWidth size="small" />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} size={6}>
                        <Controller
                            name="join_date"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Join Date" type="date" fullWidth size="small" />
                            )}
                        />
                    </Grid>

                    {/* Row 6 */}
                    <Grid item xs={12} size={6}>
                        <Controller
                            name="birthday"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Birthday" type="date" fullWidth size="small" />
                            )}
                        />
                    </Grid>

                    {/* Bio full width */}
                    <Grid item xs={12} size={6}>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Bio"
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={3}
                                />
                            )}
                        />
                    </Grid>

                    {/* Button */}
                    <Grid item xs={12} sm={12} size={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="small"
                            sx={{ minWidth: 150 }}
                        >
                            Save Changes
                        </Button>
                    </Grid>

                </Grid>
            </Box>
        </Box>
    );
}