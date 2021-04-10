import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion } from 'react-accessible-accordion';
import './AgendaView.scss';

import { CheckedCheckboxIcon, UncheckedCheckboxIcon } from '../../../utils/_icons';
import AgendaGroup from './AgendaGroup';
import Search from '../../Header/Search';
import MultipleSelectionBox from '../../MultipleSelectionBox/MultipleSelectionBox';
import MeetingItemStates from '../../../constants/MeetingItemStates';


//dnd kit
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
/**
 * Used to display a list of a meeting's agenda items and controls to
 * search and filter the items; Used in the MeetingView.
 *
 * props:
 *    meeting
 *      An object representing a meeting with an array of the agenda items
 *
 * state:
 *    showCompleted
 *      Boolean state to toggle if completed agenda items are shown
 *    selectedItems
 *      Agenda items selected by user. It is an object (has a dictionary structure) like
 *      {
 *        [meeting_id]: { [meeting_item_id]}
 *      }
 */

function AgendaView({ meeting }) {
  const { t } = useTranslation();
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedItems, setSelectedItems] = useState({});
  const [outerContainerIDs,setOuterContainerIDs] = useState(assignOuterContainerIDs);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSelectionCancel = () => {
    setSelectedItems({});
  };

  const handleAgendaItemSelection = (meetingId, itemId, isChecked) => {
    if (isChecked && !(meetingId in selectedItems)) {
      selectedItems[meetingId] = {};
    }

    const selectedAgendaItems = selectedItems[meetingId];
    if (isChecked) {
      selectedAgendaItems[itemId] = isChecked;
    } else {
      delete selectedAgendaItems[itemId];
    }
    if (Object.keys(selectedAgendaItems).length === 0) {
      // There are no more selected items with meeting id equal to `meetingId`.
      // We delete the whole entry from `selectedItems` then.
      const newSelectedItems = { ...selectedItems };
      delete newSelectedItems[meetingId];
      setSelectedItems(newSelectedItems);
    } else {
      const newSelectedItems = { ...selectedItems, [meetingId]: selectedAgendaItems };
      setSelectedItems(newSelectedItems);
    }
  };

  function groupMeetingItems (meetingItems){
    // Groups all the meeting items by `parent_meeting_item_id`.
    // Returns a hash table with keys as agenda items id (the ones without `parent_meeting_item_id`)
    // and values as the items themselves. Inside such items there can be a property `items` which
    // is an array of agenda items whose `parent_meeting_item_id` is equal to the corresponding key.
    const itemsWithNoParent = meetingItems.filter((item) => item.parent_meeting_item_id === null);
    const itemsWithParent = meetingItems.filter((item) => item.parent_meeting_item_id !== null);
  
    const agendaGroups = {};
    itemsWithNoParent.forEach((item) => {
      agendaGroups[item.id] = { ...item };
      agendaGroups[item.id].items = [];
    });

    itemsWithParent.forEach((item) => {
      // If the parent meeting item is not in the list of the meeting items,
      // the data is invalid but we ignore it here.
      if (item.parent_meeting_item_id in agendaGroups) {
        agendaGroups[item.parent_meeting_item_id].items.push(item);
      }
    });

    return agendaGroups;
  };

  const renderedItems = showCompleted
    ? meeting.items
    : meeting.items.filter((item) => item.status !== MeetingItemStates.COMPLETED);
  const agendaGroups = groupMeetingItems(renderedItems);
  
  
  function assignOuterContainerIDs(){    
    let agendaGroups = groupMeetingItems(meeting.items);
    
    let outerContainers = meeting.items.filter(meetingItem=>{
      if(meetingItem.id in agendaGroups){
        return true;
      } 
      return false;
    });
    return outerContainers.map(container=>container.id);
  };
  
  return (
    <div className="AgendaView">
      <Search />

      <button
        type="button"
        className="complete-toggle"
        onClick={() => setShowCompleted((completed) => !completed)}
      >
        {showCompleted ? <CheckedCheckboxIcon /> : <UncheckedCheckboxIcon />}
        <p>{t('meeting.tabs.agenda.list.show-closed')}</p>
      </button>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
      >
        <SortableContext 
        items={outerContainerIDs}
        strategy={verticalListSortingStrategy}
      >
          <Accordion allowZeroExpanded allowMultipleExpanded className="agenda">
            {renderedItems.map((meetingItem) => {
              if (meetingItem.id in agendaGroups) {
                
                return (
                  <AgendaGroup
                    key={meetingItem.id}
                    agendaGroup={agendaGroups[meetingItem.id]}
                    selectedItems={selectedItems}
                    handleItemSelection={handleAgendaItemSelection}
                  />
                );
              }
              return null;
            })}
          </Accordion>
        </SortableContext>
      </DndContext>
        
      { Object.keys(selectedItems).length > 0
        && (
          <MultipleSelectionBox
            selectedItems={selectedItems}
            handleCancel={handleSelectionCancel}
          />
        )}
    </div>
  );
}

export default AgendaView;
