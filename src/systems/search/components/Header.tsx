'use server';

import {
  BaseHeader,
  BaseHeaderProps,
} from '@src/lib/modules/navigation/BaseHeader';
import Sidebar from '@src/lib/modules/navigation/Sidebar';
import SearchBar from '@src/systems/search/components/SearchBar';

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
