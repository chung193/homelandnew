import { Box, Chip, Typography } from '@mui/material';

const COMMON_AMENITY_ICONS = [
    { label: 'Wi-Fi', value: 'Wifi', preview: 'Wi-Fi' },
    { label: 'Parking', value: 'Parking', preview: 'P' },
    { label: 'Pool', value: 'Pool', preview: 'Pool' },
    { label: 'Gym', value: 'Gym', preview: 'Gym' },
    { label: 'Air Conditioner', value: 'AirConditioner', preview: 'AC' },
    { label: 'TV', value: 'Tv', preview: 'TV' },
    { label: 'Kitchen', value: 'Kitchen', preview: 'Kit' },
    { label: 'Elevator', value: 'Elevator', preview: 'Lift' },
    { label: 'Security', value: 'Security', preview: 'Sec' },
    { label: 'Pet Friendly', value: 'PetFriendly', preview: 'Pets' },
    { label: 'Washing Machine', value: 'WashingMachine', preview: 'Wash' },
    { label: 'Balcony', value: 'Balcony', preview: 'Bal' },
    { label: 'Garden', value: 'Garden', preview: 'Garden' },
    { label: 'Fireplace', value: 'Fireplace', preview: 'Fire' },
    { label: 'Sauna', value: 'Sauna', preview: 'Sauna' },
    { label: 'Jacuzzi', value: 'Jacuzzi', preview: 'Jac' },
    { label: 'BBQ', value: 'Bbq', preview: 'BBQ' },
    { label: 'Playground', value: 'Playground', preview: 'Play' },
    { label: 'Laundry', value: 'Laundry', preview: 'Ldry' },
    { label: 'Terrace', value: 'Terrace', preview: 'Terr' },
    { label: 'Garage', value: 'Garage', preview: 'Gar' },
    { label: 'Desk', value: 'Desk', preview: 'Desk' },
    { label: 'Wardrobe', value: 'Wardrobe', preview: 'Ward' },
    { label: 'Refrigerator', value: 'Refrigerator', preview: 'Frig' },
    { label: 'Microwave', value: 'Microwave', preview: 'Mic' },
    { label: 'Coffee Machine', value: 'CoffeeMachine', preview: 'Coffee' },
    { label: 'Breakfast', value: 'Breakfast', preview: 'Brk' },
    { label: 'Shower', value: 'Shower', preview: 'Shwr' },
    { label: 'Bathtub', value: 'Bathtub', preview: 'Bath' },
    { label: 'Smart Lock', value: 'SmartLock', preview: 'Lock' },
    { label: 'CCTV', value: 'Cctv', preview: 'CCTV' },
    { label: 'Elevator Access', value: 'ElevatorAccess', preview: 'Lift' },
    { label: 'Solar Panel', value: 'SolarPanel', preview: 'Solar' },
    { label: 'Water Heater', value: 'WaterHeater', preview: 'Heat' },
    { label: 'Storage', value: 'Storage', preview: 'Stor' },
    { label: 'Home Office', value: 'HomeOffice', preview: 'Office' },
    { label: 'Billiard', value: 'Billiard', preview: 'Billiard' },
    { label: 'Private Cinema', value: 'PrivateCinema', preview: 'Cinema' },
    { label: 'Garden View', value: 'GardenView', preview: 'View' },
    { label: 'Sea View', value: 'SeaView', preview: 'Sea' },
    { label: 'City View', value: 'CityView', preview: 'City' },
    { label: 'Mountain View', value: 'MountainView', preview: 'Mt' },
];

const getColumns = (t) => [
    {
        field: 'stt',
        headerName: t('pages.amenity.table.stt'),
        width: 70,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
            const paginationModel = params.api.state.pagination?.paginationModel;
            const page = paginationModel?.page ?? 0;
            const pageSize = paginationModel?.pageSize ?? 0;
            const indexInPage = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
            return page * pageSize + indexInPage;
        },
    },
    {
        field: 'name',
        headerName: t('pages.amenity.table.name'),
        width: 220,
        editable: true,
    },
    {
        field: 'slug',
        headerName: t('pages.amenity.table.slug'),
        width: 180,
        editable: true,
    },
    {
        field: 'icon',
        headerName: t('pages.amenity.table.icon'),
        width: 160,
        editable: true,
        renderCell: (params) => {
            const value = params.value;
            if (!value) {
                return <Typography variant="body2" color="text.secondary">—</Typography>;
            }
            const isImage = /^https?:\/\//i.test(value) || value.startsWith('data:image/');
            const matchedIcon = COMMON_AMENITY_ICONS.find((icon) => icon.value.toLowerCase() === value.toLowerCase());
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isImage ? <img src={value} alt="amenity icon" style={{ width: 24, height: 24, objectFit: 'contain' }} /> : matchedIcon ? <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.9rem' }}>{matchedIcon.preview}</Typography> : <Chip label={value} size="small" variant="outlined" />}
                </Box>
            );
        },
    },
    {
        field: 'sort_order',
        headerName: t('pages.amenity.table.sortOrder'),
        width: 120,
        editable: true,
    },
    {
        field: 'is_active',
        headerName: t('pages.amenity.table.isActive'),
        width: 120,
        editable: true,
        renderCell: (params) => <Chip label={params.value ? 'Hiển thị' : 'Ẩn'} color={params.value ? 'success' : 'default'} size="small" />,
    },
];

export default getColumns;
