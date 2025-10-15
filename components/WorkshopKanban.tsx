import React from 'react';
import { KANBAN_STAGES_ORDER, STAGE_COLORS } from '../constants';
import type { KanbanStage, KanbanTask } from '../types';
import { Icon } from './Icon';

interface WorkshopKanbanProps {
    tasks: KanbanTask[];
}

const KanbanCard: React.FC<{ task: KanbanTask }> = ({ task }) => (
    <div className={`bg-light dark:bg-gray-800/80 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow border-t-4 ${STAGE_COLORS[task.stage]}`}>
        <p className="font-bold text-sm text-light-text dark:text-dark-text">{`${task.vehicle.make} ${task.vehicle.model}`}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{task.vehicle.plate}</p>
        <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                <Icon name="user" className="w-3 h-3 mr-1" />
                {task.mechanic}
            </span>
            <img src={`https://i.pravatar.cc/48?u=${task.mechanic}`} alt={task.mechanic} className="w-6 h-6 rounded-full" />
        </div>
    </div>
);

const KanbanColumn: React.FC<{ stage: KanbanStage, tasks: KanbanTask[] }> = ({ stage, tasks }) => (
    <div className="flex-shrink-0 w-72 bg-gray-100 dark:bg-dark-light rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-bold text-sm uppercase tracking-wider text-light-text dark:text-dark-text">{stage}</h3>
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-black dark:bg-gray-900/30 px-2 py-1 rounded-full">{tasks.length}</span>
        </div>
        <div className="p-3 space-y-3 overflow-y-auto h-[300px]">
            {tasks.map(task => <KanbanCard key={task.id} task={task} />)}
        </div>
    </div>
);

const WorkshopKanban: React.FC<WorkshopKanbanProps> = ({ tasks }) => {
    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Flujo del Taller</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visualización del estado de los vehículos en tiempo real en la sede.</p>
            </div>
            <div className="p-6">
                <div className="flex space-x-6 overflow-x-auto pb-4">
                    {KANBAN_STAGES_ORDER.map(stage => (
                        <KanbanColumn 
                            key={stage} 
                            stage={stage} 
                            tasks={tasks.filter(task => task.stage === stage)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkshopKanban;