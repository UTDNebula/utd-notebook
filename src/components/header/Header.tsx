'use server';

import SearchBar from '@src/components/header/SearchBar';
import {
  BaseHeader,
  BaseHeaderProps,
} from '@src/lib/modules/navigation/BaseHeader';
import Sidebar from '@src/lib/modules/navigation/Sidebar';

const DefaultHeaderItems = () => <></>;

const Header = async (props: BaseHeaderProps) => {
  return (
    <BaseHeader
      menu={<Sidebar homepage={props.shadow} hamburgerColor={props.color} />}
      searchBar={<SearchBar />}
      {...props}
    >
      {props.children}
      <DefaultHeaderItems />
    </BaseHeader>
  );
};

export default Header;
