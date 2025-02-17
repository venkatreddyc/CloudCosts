import Image from 'next/image';
import { NextRouter } from 'next/router';
import formatNumber from '../../../../utils/formatNumber';
import providers, { Provider } from '../../../../utils/providerHelper';
import regex from '../../../../utils/regex';
import Button from '../../../button/Button';
import Checkbox from '../../../checkbox/Checkbox';
import Input from '../../../input/Input';
import Sidepanel from '../../../sidepanel/Sidepanel';
import SidepanelHeader from '../../../sidepanel/SidepanelHeader';
import SidepanelPage from '../../../sidepanel/SidepanelPage';
import SidepanelTabs from '../../../sidepanel/SidepanelTabs';
import { ToastProps } from '../../../toast/hooks/useToast';
import {
  HiddenResource,
  InventoryFilterDataProps,
  InventoryStats,
  ViewProps
} from '../../hooks/useInventory';
import InventoryFilterSummary from '../filter/InventoryFilterSummary';
import useViews from './hooks/useViews';

type InventoryViewProps = {
  filters: InventoryFilterDataProps[];
  displayedFilters: InventoryFilterDataProps[];
  setToast: (toast: ToastProps | undefined) => void;
  inventoryStats: InventoryStats;
  router: NextRouter;
  views: ViewProps[] | undefined;
  getViews: (edit?: boolean | undefined, viewName?: string | undefined) => void;
  hiddenResources: HiddenResource[] | undefined;
  setHideOrUnhideHasUpdate: (hideOrUnhideHasUpdate: boolean) => void;
};
function InventoryView({
  filters,
  displayedFilters,
  setToast,
  inventoryStats,
  router,
  views,
  getViews,
  hiddenResources,
  setHideOrUnhideHasUpdate
}: InventoryViewProps) {
  const {
    isOpen,
    openModal,
    closeModal,
    view,
    handleChange,
    saveView,
    loading,
    page,
    goTo,
    deleteView,
    bulkItems,
    bulkSelectCheckbox,
    onCheckboxChange,
    handleBulkSelection,
    unhideLoading,
    unhideResources
  } = useViews({
    setToast,
    views,
    router,
    getViews,
    hiddenResources,
    setHideOrUnhideHasUpdate
  });

  return (
    <>
      {/* Save as a view button */}
      <Button size="sm" onClick={() => openModal(filters)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 8.99v11.36c0 1.45-1.04 2.06-2.31 1.36l-3.93-2.19c-.42-.23-1.1-.23-1.52 0l-3.93 2.19c-1.27.7-2.31.09-2.31-1.36V8.99c0-1.71 1.4-3.11 3.11-3.11h7.78c1.71 0 3.11 1.4 3.11 3.11z"
          ></path>
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M22 5.11v11.36c0 1.45-1.04 2.06-2.31 1.36L16 15.77V8.99c0-1.71-1.4-3.11-3.11-3.11H8v-.77C8 3.4 9.4 2 11.11 2h7.78C20.6 2 22 3.4 22 5.11zM7 12h4M9 14v-4"
          ></path>
        </svg>
        {router.query.view ? 'Manage view' : 'Save as a view'}
      </Button>

      {/* Sidepanel */}
      <Sidepanel isOpen={isOpen} closeModal={closeModal} noScroll={true}>
        <SidepanelHeader
          title={router.query.view ? view.name : 'Save as a view'}
          subtitle={`${inventoryStats?.resources} ${
            inventoryStats?.resources === 1 ? 'resource' : 'resources'
          } ${
            router.query.view
              ? 'are part of this view'
              : 'will be added to this view'
          }`}
          deleteAction={router.query.view ? deleteView : undefined}
          deleteLabel="Delete view"
          closeModal={closeModal}
        />
        <SidepanelTabs
          goTo={goTo}
          page={page}
          tabs={router.query.view ? ['View', 'Hidden Resources'] : ['View']}
        />
        <SidepanelPage page={page} param="view">
          <form onSubmit={e => saveView(e)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {displayedFilters?.length > 0 &&
                displayedFilters.map((data, idx) => (
                  <InventoryFilterSummary key={idx} data={data} />
                ))}
            </div>
            <Input
              name="name"
              label={router.query.view ? 'View name' : 'Choose a view name'}
              type="text"
              regex={regex.required}
              error="Please provide a name"
              value={view.name}
              action={handleChange}
              autofocus={true}
            />

            <div className="ml-auto">
              <Button
                size="lg"
                type="submit"
                loading={loading}
                disabled={!view.name}
              >
                {router.query.view ? 'Update view' : 'Save as a view'}{' '}
                <span className="flex items-center justify-center bg-black-900/20 text-xs py-1 px-2 rounded-lg">
                  {inventoryStats?.resources}
                </span>
              </Button>
            </div>
          </form>
        </SidepanelPage>
        <SidepanelPage page={page} param="hidden resources">
          {hiddenResources && hiddenResources.length > 0 && (
            <>
              <div className="max-h-[calc(100vh-300px)] overflow-scroll">
                <table className="table-auto w-full text-xs text-left bg-white text-gray-900">
                  <thead className="bg-white">
                    <tr className="shadow-[inset_0_-1px_0_0_#cfd7d74d]">
                      <th className="py-4 px-2">
                        <div className="flex items-center">
                          <Checkbox
                            checked={bulkSelectCheckbox}
                            onChange={handleBulkSelection}
                          />
                        </div>
                      </th>
                      <th className="py-4 px-2">Cloud</th>
                      <th className="py-4 px-2">Service</th>
                      <th className="py-4 px-2">Name</th>
                      <th className="py-4 px-2">Region</th>
                      <th className="py-4 px-2">Account</th>
                      <th className="py-4 px-2 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hiddenResources.map(item => (
                      <tr
                        key={item.id}
                        className="bg-white hover:bg-black-100 border-black-200/30 border-b last:border-none"
                      >
                        <td className="py-4 px-2">
                          <Checkbox
                            checked={
                              bulkItems &&
                              !!bulkItems.find(
                                currentId => currentId === item.id
                              )
                            }
                            onChange={e => onCheckboxChange(e, item.id)}
                          />
                        </td>
                        <td className="py-4 pl-2 pr-6">
                          <div className="flex items-center gap-2">
                            <picture className="flex-shrink-0">
                              <img
                                src={providers.providerImg(
                                  item.provider as Provider
                                )}
                                className="w-6 h-6 rounded-full"
                                alt={item.provider}
                              />
                            </picture>
                            <span>{item.provider}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">{item.service}</td>
                        <td className="py-4 px-2">
                          <p className="w-24 truncate ...">{item.name}</p>
                        </td>
                        <td className="py-4 px-2">
                          <p className="w-24 truncate ...">{item.region}</p>
                        </td>
                        <td className="py-4 px-2">
                          <p className="w-24 truncate ...">{item.account}</p>
                        </td>
                        <td className="py-4 px-2 text-right">
                          ${formatNumber(item.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <Button
                  size="lg"
                  disabled={bulkItems && bulkItems.length === 0}
                  loading={unhideLoading}
                  onClick={unhideResources}
                >
                  Unhide resources{' '}
                  <span className="flex items-center justify-center bg-white/10 text-xs py-1 px-2 rounded-lg">
                    {formatNumber(bulkItems.length)}
                  </span>
                </Button>
              </div>
            </>
          )}

          {hiddenResources && hiddenResources.length === 0 && (
            <div className="p-6 bg-black-100 rounded-lg">
              <div className="flex flex-col gap-6 items-center">
                <Image
                  src="/assets/img/purplin/dashboard.svg"
                  alt="Purplin"
                  width={150}
                  height={100}
                />
                <div className="flex flex-col gap-2 px-24 items-center justify-center text-center">
                  <p className="text-black-900 font-semibold">
                    No hidden resources in this view
                  </p>
                  <p className="text-sm text-black-400">
                    To hide a resource from this view, select and hide them on
                    the inventory table.
                  </p>
                </div>
              </div>
            </div>
          )}
        </SidepanelPage>
      </Sidepanel>
    </>
  );
}

export default InventoryView;
