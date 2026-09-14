import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import { Button } from '@mui/material';
import AdminHeader from '@src/components/admin/AdminHeader';

export default function Page() {
  return (
    <AdminHeader path={['Admin']}>
      <div className="flex flex-wrap items-center gap-x-10 gap-y-2 max-sm:gap-x-4">
        {/*<Link href="/admin/sections">*/}
        <Button
          variant="contained"
          className="whitespace-nowrap normal-case"
          startIcon={<GroupsIcon />}
          size="large"
          disabled
        >
          Sections
        </Button>
        {/*</Link>*/}
        {/*<Link href="/admin/users">*/}
        <Button
          variant="contained"
          className="normal-case"
          startIcon={<PersonIcon />}
          size="large"
          disabled
        >
          Users
        </Button>
        {/*</Link>*/}
      </div>
    </AdminHeader>
  );
}
